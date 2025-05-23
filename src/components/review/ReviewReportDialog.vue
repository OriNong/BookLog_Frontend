<template>
    <v-dialog v-model="isOpen" max-width="500">
        <v-card>
            <v-card-title class="text-h6 font-weight-bold">
                리뷰 신고
            </v-card-title>
            <v-card-text>
                <v-radio-group v-model="selectedReasonCode" label="신고 사유" mandatory>
                    <v-radio label="욕설, 인신공격, 차별적 표현 등 포함" value="INSULT" />
                    <v-radio label="스팸 메시지 포함" value="SPAM" />
                    <v-radio label="음란성, 혐오 표현, 불쾌한 표현 포함" value="INAPPROPRIATE" />
                    <v-radio label="도서와 무관한 내용, 리뷰 목적에 맞지 않음" value="IRRELEVANT" />
                    <v-radio label="기타" value="OTHER" />
                </v-radio-group>

                <v-textarea v-if="selectedReasonCode === 'OTHER'" v-model="reasonText" label="상세 사유" rows="3" auto-grow
                    :counter="200" maxlength="200" />
            </v-card-text>

            <v-card-actions>
                <v-spacer />
                <v-btn text @click="close">취소</v-btn>
                <v-btn color="primary" @click="submit"
                    :disabled="!selectedReasonCode || (selectedReasonCode === 'OTHER' && !reasonText.trim())">
                    제출
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { reportService } from '@/services/reportService';

const props = defineProps({
    reviewId: Number,
    reportId: Number,
    reasonCode: String,
    reason: String,
    open: Boolean
});
const emit = defineEmits(['close', 'submitted']);

const isOpen = ref(props.open);
watch(() => props.open, (val) => isOpen.value = val);
watch(isOpen, (val) => { if (!val) emit('close'); });

const selectedReasonCode = ref(props.reasonCode || '');
const reasonText = ref(props.reasonCode === 'OTHER' ? props.reason : '');

watch(() => props.open, (val) => {
    if (val) {
        selectedReasonCode.value = props.reasonCode || '';
        reasonText.value = props.reasonCode === 'OTHER' ? props.reason : '';
    }
});

const reasonLabels = {
    INSULT: '욕설, 인신공격, 차별적 표현 등 포함',
    SPAM: '스팸 메시지 포함',
    INAPPROPRIATE: '음란성, 혐오 표현, 불쾌한 표현 포함',
    IRRELEVANT: '도서와 무관한 내용, 리뷰 목적에 맞지 않음',
    OTHER: '기타',
};

const close = () => {
    isOpen.value = false;
};

const submit = async () => {
    const payload = {
        reasonCode: selectedReasonCode.value,
        reason: selectedReasonCode.value === 'OTHER'
            ? reasonText.value
            : reasonLabels[selectedReasonCode.value]
    };

    try {
        if (props.reportId) {
            await reportService.updateReport(props.reportId, {
                reasonCode: selectedReasonCode.value,
                reason: selectedReasonCode.value === 'OTHER'
                    ? reasonText.value
                    : reasonLabels[selectedReasonCode.value]
            });
        } else {
            await reportService.submitReport({
                reviewId: props.reviewId,
                ...payload
            });
        }
        alert('신고가 처리되었습니다.');
        emit('submitted');
        isOpen.value = false;
    } catch (err) {
        console.error('신고 처리 실패:', err);
        alert(err.response.data.message);
    }
};
</script>
