package middleware

import (
	"encoding/base64"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestEncodeAuditBodyStoresTextBodiesAsText(t *testing.T) {
	body, encoding := encodeAuditBody([]byte(`{"model":"gpt-test"}`), "application/json")

	assert.Equal(t, `{"model":"gpt-test"}`, body)
	assert.Equal(t, "text", encoding)
}

func TestEncodeAuditBodyStoresBinaryBodiesAsBase64(t *testing.T) {
	raw := []byte{0xff, 0x00, 0x01}
	body, encoding := encodeAuditBody(raw, "application/octet-stream")

	assert.Equal(t, base64.StdEncoding.EncodeToString(raw), body)
	assert.Equal(t, "base64", encoding)
}

func TestCloneSanitizedAuditHeadersRedactsSecrets(t *testing.T) {
	headers := http.Header{
		"Authorization":          []string{"Bearer secret"},
		"X-Goog-Api-Key":         []string{"secret"},
		"Sec-Websocket-Protocol": []string{"realtime, openai-insecure-api-key.sk-secret"},
		"User-Agent":             []string{"new-api-test"},
	}

	cloned := cloneSanitizedAuditHeaders(headers)

	assert.Equal(t, []string{auditRedactedValue}, cloned["Authorization"])
	assert.Equal(t, []string{auditRedactedValue}, cloned["X-Goog-Api-Key"])
	assert.Equal(t, []string{auditRedactedValue}, cloned["Sec-Websocket-Protocol"])
	assert.Equal(t, []string{"new-api-test"}, cloned["User-Agent"])
}

func TestSanitizeAuditRequestURIRedactsSensitiveQueryValues(t *testing.T) {
	gin.SetMode(gin.TestMode)
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	c.Request = httptest.NewRequest(http.MethodPost, "/v1beta/models/gemini:generateContent?key=secret&foo=bar&access_token=token", nil)

	uri := sanitizeAuditRequestURI(c)

	assert.Contains(t, uri, "foo=bar")
	assert.NotContains(t, uri, "secret")
	assert.NotContains(t, uri, "access_token=token")
	assert.Contains(t, uri, "key=%5BREDACTED%5D")
	assert.Contains(t, uri, "access_token=%5BREDACTED%5D")
}
