package controller

import (
	"testing"

	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/QuantumNous/new-api/setting/operation_setting"

	"github.com/stretchr/testify/assert"
)

func TestRetryLimitForEarlyResponsesStreamError(t *testing.T) {
	setting := operation_setting.GetQiqiSetting()
	original := *setting
	t.Cleanup(func() { *setting = original })

	setting.ResponsesStreamErrorRetryEnabled = true
	setting.ResponsesStreamErrorRetryTimes = 2
	info := &relaycommon.RelayInfo{ResponsesStreamErrorBeforeCommit: true}
	assert.Equal(t, 2, retryLimitForRelayError(info, 0))

	info.ResponsesStreamErrorBeforeCommit = false
	assert.Equal(t, 4, retryLimitForRelayError(info, 4))

	info.ResponsesStreamErrorBeforeCommit = true
	setting.ResponsesStreamErrorRetryEnabled = false
	assert.Equal(t, 4, retryLimitForRelayError(info, 4))
}
