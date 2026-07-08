package operation_setting

import "github.com/QuantumNous/new-api/setting/config"

type QiqiSetting struct {
	ContextRequestLoggingEnabled bool `json:"context_request_logging_enabled"`
}

var qiqiSetting = QiqiSetting{
	ContextRequestLoggingEnabled: false,
}

func init() {
	config.GlobalConfig.Register("qiqi_setting", &qiqiSetting)
}

func GetQiqiSetting() *QiqiSetting {
	return &qiqiSetting
}

func IsContextRequestLoggingEnabled() bool {
	return qiqiSetting.ContextRequestLoggingEnabled
}
