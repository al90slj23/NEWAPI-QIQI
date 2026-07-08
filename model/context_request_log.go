package model

import (
	"github.com/QuantumNous/new-api/common"
)

type ContextRequestLog struct {
	Id                   int    `json:"id" gorm:"index:idx_qiqi_context_request_logs_created_at_id,priority:2;index:idx_qiqi_context_request_logs_user_id_id,priority:2"`
	UserId               int    `json:"user_id" gorm:"index;index:idx_qiqi_context_request_logs_user_id_id,priority:1"`
	CreatedAt            int64  `json:"created_at" gorm:"bigint;index:idx_qiqi_context_request_logs_created_at_id,priority:1"`
	RequestId            string `json:"request_id" gorm:"type:varchar(64);index;default:''"`
	Method               string `json:"method" gorm:"type:varchar(16);default:''"`
	Path                 string `json:"path"`
	Ip                   string `json:"ip" gorm:"index;default:''"`
	UserAgent            string `json:"user_agent"`
	Username             string `json:"username" gorm:"index;default:''"`
	TokenId              int    `json:"token_id" gorm:"default:0;index"`
	TokenName            string `json:"token_name" gorm:"index;default:''"`
	ModelName            string `json:"model_name" gorm:"index;default:''"`
	Group                string `json:"group" gorm:"index"`
	IsStream             bool   `json:"is_stream"`
	StatusCode           int    `json:"status_code" gorm:"index;default:0"`
	LatencyMs            int64  `json:"latency_ms" gorm:"default:0"`
	Error                string `json:"error" gorm:"default:''"`
	ChannelId            int    `json:"channel_id" gorm:"index;default:0"`
	ChannelName          string `json:"channel_name" gorm:"default:''"`
	ChannelType          int    `json:"channel_type" gorm:"index;default:0"`
	NodeName             string `json:"node_name" gorm:"index;default:''"`
	RequestHeaders       string `json:"request_headers"`
	ResponseHeaders      string `json:"response_headers"`
	RequestBody          string `json:"request_body"`
	RequestBodyEncoding  string `json:"request_body_encoding" gorm:"type:varchar(16);default:''"`
	RequestBodySize      int64  `json:"request_body_size" gorm:"default:0"`
	ResponseBody         string `json:"response_body"`
	ResponseBodyEncoding string `json:"response_body_encoding" gorm:"type:varchar(16);default:''"`
	ResponseBodySize     int64  `json:"response_body_size" gorm:"default:0"`
}

func (ContextRequestLog) TableName() string {
	return "qiqi_context_request_logs"
}

func ensureContextRequestLogRequestId(log *ContextRequestLog) {
	if log != nil && log.RequestId == "" {
		log.RequestId = common.NewRequestId()
	}
}

func RecordContextRequestLog(log *ContextRequestLog) error {
	if log == nil || LOG_DB == nil {
		return nil
	}
	ensureContextRequestLogRequestId(log)
	return LOG_DB.Create(log).Error
}
