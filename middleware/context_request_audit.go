package middleware

import (
	"bytes"
	"encoding/base64"
	"io"
	"net/http"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting/operation_setting"

	"github.com/bytedance/gopkg/util/gopool"
	"github.com/gin-gonic/gin"
)

const auditRedactedValue = "[REDACTED]"

type contextRequestAuditResponseWriter struct {
	gin.ResponseWriter
	body bytes.Buffer
}

func (w *contextRequestAuditResponseWriter) Write(data []byte) (int, error) {
	if len(data) > 0 {
		_, _ = w.body.Write(data)
	}
	return w.ResponseWriter.Write(data)
}

func (w *contextRequestAuditResponseWriter) WriteString(data string) (int, error) {
	if data != "" {
		_, _ = w.body.WriteString(data)
	}
	return w.ResponseWriter.WriteString(data)
}

func ContextRequestAudit() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !operation_setting.IsContextRequestLoggingEnabled() {
			c.Next()
			return
		}

		start := time.Now()
		writer := &contextRequestAuditResponseWriter{ResponseWriter: c.Writer}
		c.Writer = writer
		c.Next()

		recordContextRequestAudit(c, start, writer)
	}
}

func recordContextRequestAudit(c *gin.Context, start time.Time, writer *contextRequestAuditResponseWriter) {
	requestBody, requestBodyErr := readAuditRequestBody(c)
	requestBodyText, requestBodyEncoding := encodeAuditBody(requestBody, c.Request.Header.Get("Content-Type"))
	responseBody := append([]byte(nil), writer.body.Bytes()...)
	responseBodyText, responseBodyEncoding := encodeAuditBody(responseBody, c.Writer.Header().Get("Content-Type"))

	errorText := strings.TrimSpace(c.Errors.String())
	if requestBodyErr != nil {
		if errorText != "" {
			errorText += "\n"
		}
		errorText += "request body capture failed: " + requestBodyErr.Error()
	}

	entry := &model.ContextRequestLog{
		UserId:               c.GetInt("id"),
		CreatedAt:            start.Unix(),
		RequestId:            auditRequestId(c),
		Method:               c.Request.Method,
		Path:                 sanitizeAuditRequestURI(c),
		Ip:                   c.ClientIP(),
		UserAgent:            c.Request.UserAgent(),
		Username:             c.GetString("username"),
		TokenId:              c.GetInt("token_id"),
		TokenName:            c.GetString("token_name"),
		ModelName:            c.GetString("original_model"),
		Group:                common.GetContextKeyString(c, constant.ContextKeyUsingGroup),
		IsStream:             common.GetContextKeyBool(c, constant.ContextKeyIsStream),
		StatusCode:           writer.Status(),
		LatencyMs:            time.Since(start).Milliseconds(),
		Error:                errorText,
		ChannelId:            common.GetContextKeyInt(c, constant.ContextKeyChannelId),
		ChannelName:          common.GetContextKeyString(c, constant.ContextKeyChannelName),
		ChannelType:          common.GetContextKeyInt(c, constant.ContextKeyChannelType),
		NodeName:             common.NodeName,
		RequestHeaders:       marshalAuditJSON(cloneSanitizedAuditHeaders(c.Request.Header)),
		ResponseHeaders:      marshalAuditJSON(cloneSanitizedAuditHeaders(c.Writer.Header())),
		RequestBody:          requestBodyText,
		RequestBodyEncoding:  requestBodyEncoding,
		RequestBodySize:      int64(len(requestBody)),
		ResponseBody:         responseBodyText,
		ResponseBodyEncoding: responseBodyEncoding,
		ResponseBodySize:     int64(len(responseBody)),
	}

	if entry.Group == "" {
		entry.Group = common.GetContextKeyString(c, constant.ContextKeyTokenGroup)
	}

	gopool.Go(func() {
		if err := model.RecordContextRequestLog(entry); err != nil {
			common.SysLog("failed to record context request log: " + err.Error())
		}
	})
}

func auditRequestId(c *gin.Context) string {
	requestId := c.GetString(common.RequestIdKey)
	if requestId != "" {
		return requestId
	}
	return common.NewRequestId()
}

func readAuditRequestBody(c *gin.Context) ([]byte, error) {
	if c.Request == nil || c.Request.Body == nil {
		return nil, nil
	}
	if c.Request.ContentLength == 0 && c.Request.Method == http.MethodGet {
		return nil, nil
	}

	storage, err := common.GetBodyStorage(c)
	if err != nil {
		return nil, err
	}
	if _, err := storage.Seek(0, io.SeekStart); err != nil {
		return nil, err
	}
	body, err := storage.Bytes()
	if err != nil {
		return nil, err
	}
	if _, err := storage.Seek(0, io.SeekStart); err != nil {
		return body, err
	}
	c.Request.Body = io.NopCloser(storage)
	return body, nil
}

func encodeAuditBody(body []byte, contentType string) (string, string) {
	if len(body) == 0 {
		return "", ""
	}
	if shouldStoreAuditBodyAsText(body, contentType) {
		return string(body), "text"
	}
	return base64.StdEncoding.EncodeToString(body), "base64"
}

func shouldStoreAuditBodyAsText(body []byte, contentType string) bool {
	mediaType := strings.ToLower(strings.TrimSpace(strings.Split(contentType, ";")[0]))
	if strings.HasPrefix(mediaType, "text/") ||
		strings.Contains(mediaType, "json") ||
		strings.Contains(mediaType, "xml") ||
		strings.Contains(mediaType, "javascript") ||
		strings.Contains(mediaType, "event-stream") ||
		mediaType == "application/x-www-form-urlencoded" ||
		mediaType == "application/graphql" {
		return true
	}
	return utf8.Valid(body)
}

func cloneSanitizedAuditHeaders(headers http.Header) map[string][]string {
	cloned := make(map[string][]string, len(headers))
	for key, values := range headers {
		canonicalKey := http.CanonicalHeaderKey(key)
		if isSensitiveAuditHeader(key) {
			cloned[canonicalKey] = []string{auditRedactedValue}
			continue
		}
		cloned[canonicalKey] = append([]string(nil), values...)
	}
	return cloned
}

func isSensitiveAuditHeader(key string) bool {
	switch strings.ToLower(key) {
	case "authorization",
		"proxy-authorization",
		"x-api-key",
		"x-goog-api-key",
		"api-key",
		"openai-api-key",
		"mj-api-secret",
		"cookie",
		"set-cookie",
		"sec-websocket-protocol":
		return true
	default:
		return false
	}
}

func sanitizeAuditRequestURI(c *gin.Context) string {
	if c.Request == nil || c.Request.URL == nil {
		return ""
	}
	requestURL := *c.Request.URL
	query := requestURL.Query()
	for key := range query {
		if isSensitiveAuditQueryKey(key) {
			query.Set(key, auditRedactedValue)
		}
	}
	requestURL.RawQuery = query.Encode()
	return requestURL.RequestURI()
}

func isSensitiveAuditQueryKey(key string) bool {
	switch strings.ToLower(key) {
	case "key", "api_key", "apikey", "access_token", "token", "authorization", "auth":
		return true
	default:
		return false
	}
}

func marshalAuditJSON(value any) string {
	data, err := common.Marshal(value)
	if err != nil {
		return ""
	}
	return string(data)
}
