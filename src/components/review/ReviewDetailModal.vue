<template>
    <v-dialog v-model="isOpen" max-width="700" scrollable persistent>
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
                <span class="text-h6">{{ review?.reviewTitle }}</span>
                <div class="d-flex align-center">
                    <template v-if="auth.user?.nickname === review?.nickname">
                        <v-btn size="small" variant="text" @click="goToEditPage">리뷰 수정</v-btn>
                        <v-btn size="small" variant="text" color="error" @click="confirmDelete">리뷰 삭제</v-btn>
                    </template>
                    <v-btn icon @click="emit('close')">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </div>
            </v-card-title>

            <v-card-text>
                <div class="text-caption text-grey mb-2">
                    작성자: {{ review?.nickname }} ｜ 평점: {{ review?.rating }}점
                </div>
                <div class="text-body-1 mb-4">{{ review?.reviewContent }}</div>
                <div class="text-caption text-grey mb-6">작성일: {{ formatDate(review?.createdAt) }}</div>

                <div class="font-weight-medium mb-2">💬 댓글 ({{ comments.length }})</div>
                <v-list>
                    <template v-for="comment in comments" :key="comment.commentId">
                        <v-list-item class="px-0">
                            <div class="w-100">
                                <div class="d-flex justify-space-between align-center">
                                    <div>
                                        <div class="text-subtitle-2 font-weight-medium">
                                            {{ comment.userNickname }}
                                        </div>

                                        <div v-if="editingCommentId === comment.commentId">
                                            <v-textarea v-model="editedContent" auto-grow rows="2" />
                                            <div class="text-right mt-1">
                                                <v-btn size="small" color="primary"
                                                    @click="updateComment(comment.commentId, comment.deleted)">저장</v-btn>
                                                <v-btn size="small" variant="text" @click="cancelEdit">취소</v-btn>
                                            </div>
                                        </div>

                                        <template v-else>
                                            <div class="text-body-2 mb-1">
                                                {{ comment.deleted ? '삭제된 댓글입니다.' : comment.content }}
                                            </div>
                                            <div class="text-caption text-grey">{{ formatDate(comment.createdAt) }}
                                            </div>
                                            <v-btn size="small" variant="text"
                                                @click="toggleReply(comment.commentId)">답글 달기</v-btn>
                                        </template>
                                    </div>

                                    <div v-if="auth.user?.userId === comment.userId">
                                        <v-btn size="x-small" variant="text" @click="editComment(comment)">수정</v-btn>
                                        <v-btn v-if="!comment.deleted" size="x-small" variant="text" color="error"
                                            @click="deleteComment(comment.commentId)">삭제</v-btn>
                                    </div>
                                </div>
                            </div>
                        </v-list-item>

                        <v-list-item v-for="reply in comment.replies" :key="reply.commentId" class="pl-10">
                            <div class="w-100">
                                <div class="d-flex justify-space-between align-center">
                                    <div>
                                        <div class="text-subtitle-2 font-weight-medium">↳ {{ reply.userNickname }}</div>

                                        <div v-if="editingCommentId === reply.commentId">
                                            <v-textarea v-model="editedContent" auto-grow rows="2" />
                                            <div class="text-right mt-1">
                                                <v-btn size="small" color="primary"
                                                    @click="updateComment(reply.commentId, reply.deleted)">저장</v-btn>
                                                <v-btn size="small" variant="text" @click="cancelEdit">취소</v-btn>
                                            </div>
                                        </div>

                                        <template v-else>
                                            <div class="text-body-2 mb-1">
                                                {{ reply.deleted ? '삭제된 댓글입니다.' : reply.content }}
                                            </div>
                                            <div class="text-caption text-grey">{{ formatDate(reply.createdAt) }}</div>
                                        </template>
                                    </div>

                                    <div v-if="auth.user?.userId === reply.userId">
                                        <v-btn size="x-small" variant="text" @click="editComment(reply)">수정</v-btn>
                                        <v-btn v-if="!reply.deleted" size="x-small" variant="text" color="error"
                                            @click="deleteComment(reply.commentId)">삭제</v-btn>
                                    </div>
                                </div>
                            </div>
                        </v-list-item>

                        <div v-if="activeReply === comment.commentId" class="pl-10 pr-3 pb-4">
                            <v-textarea v-model="replyContent" auto-grow label="답글을 입력하세요" rows="2" maxlength="100"/>
                            <div class="text-right mt-1">
                                <v-btn size="small" color="primary" @click="submitReply(comment.commentId)">등록</v-btn>
                                <v-btn size="small" variant="text" @click="cancelReply">취소</v-btn>
                            </div>
                        </div>
                    </template>
                </v-list>

                <v-textarea v-model="newComment" label="댓글을 입력하세요" auto-grow rows="2" class="mt-4" maxlength="100"/>
            </v-card-text>

            <v-card-actions>
                <v-btn v-if="auth.user?.nickname != review?.nickname" color="error" variant="tonal" size="small" @click="showReportDialog = true">
                    리뷰 신고
                </v-btn>
                <v-spacer />
                <v-btn color="primary" @click="submitComment(review.commentId)" :disabled="!newComment.trim()">
                    댓글 등록
                </v-btn>
                <!-- 리뷰 신고 다이얼로그 연결 -->
                <ReviewReportDialog :review-id="props.reviewId" :open="showReportDialog"
                    @close="showReportDialog = false" @submitted="showReportDialog = false" />
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { reviewService } from '@/services/reviewService';
import { commentService } from '@/services/commentService';
import { useAuthStore } from '@/stores/auth';
import ReviewReportDialog from './ReviewReportDialog.vue';
import dayjs from 'dayjs';

// 댓글 수정/삭제를 위한 로그인 사용자 정보
const auth = useAuthStore();

// 페이지 이동 처리
const router = useRouter();

const props = defineProps({
    reviewId: Number,
    open: Boolean
});

const emit = defineEmits(['close', 'refresh']);

// 리뷰 상세보기 모달 관련 상태
const isOpen = ref(props.open);
watch(() => props.open, (val) => isOpen.value = val);
watch(isOpen, (val) => { if (!val) emit('close'); });

// 리뷰, 댓글 관련 상태
const review = ref(null);
const comments = ref([]);
const newComment = ref('');

// 대댓글 관련 상태
const activeReply = ref(null);
const replyContent = ref('');

// 댓글 수정 관련 상태
const editingCommentId = ref(null);      // 수정 중인 댓글 ID
const editedContent = ref('');           // 수정 내용 임시 저장

// 신고하기 관련 상태
const showReportDialog = ref(false);


// 날짜 포맷
const formatDate = (dt) => dayjs(dt).format('YYYY.MM.DD HH:mm');

// 리뷰 상세정보 불러오기
const fetchReviewDetail = async () => {
    try {
        const { data } = await reviewService.getReviewDetailByReviewId(props.reviewId);
        review.value = data;
    } catch (err) {
        console.error(err.response.data.message);
        alert(err.response.data.message);
    }
};
// 리뷰 수정 시 수정 페이지 이동
const goToEditPage = () => {
    emit('close'); // 모달 먼저 닫고
    emit('refresh');  // 리뷰 목록 갱신 요청
    router.push(`/review/edit/${review.value.reviewId}`);
};

// 리뷰 삭제 처리
const confirmDelete = async () => {
    const confirmed = window.confirm("정말로 이 리뷰를 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
        await reviewService.deleteReview(review.value.reviewId);
        alert("리뷰가 삭제되었습니다.");
        emit('close');
        emit('refresh'); // 리뷰 목록 다시 불러오기 요청
    } catch (err) {
        console.error("리뷰 삭제 실패:", err);
        alert(err.response.data.message);
    }
};

// 댓글 목록
const fetchComments = async () => {
    try {
        const { data } = await commentService.getReviewComments(props.reviewId);
        comments.value = data;
        console.log(comments.value);
    } catch (err) {
        alert(err.response.data.message);
    }
};


// 댓글 등록
const submitComment = async () => {
    if (!newComment.value.trim()) return;

    try {
        await commentService.postReviewComment(props.reviewId, {
            content: newComment.value,
            parentCommentId: null, // 일반 댓글이므로 null
        });
        newComment.value = '';
        await fetchComments();
    } catch (err) {
        console.error('댓글 등록 실패', err);
        alert(err.response.data.message);
    }
};

// 대댓글 창 열기
const toggleReply = (commentId) => {
    if (activeReply.value === commentId) {
        activeReply.value = null;
    } else {
        activeReply.value = commentId;
        replyContent.value = '';
    }
};

// 대댓글 취소
const cancelReply = () => {
    activeReply.value = null;
    replyContent.value = '';
};

// 대댓글 작성
const submitReply = async (parentCommentId) => {
    if (!replyContent.value.trim()) return;
    try {
        await commentService.postReviewComment(props.reviewId, {
            content: replyContent.value,
            parentCommentId
        });
        await fetchComments();
        replyContent.value = '';
        activeReply.value = null;
    } catch (err) {
        console.error(' 대댓글 등록 실패', err);
        alert(err.response.data.message);
    }
};

// 댓글 수정 (본인 댓글만 가능)
const editComment = (comment) => {
    editingCommentId.value = comment.commentId;
    editedContent.value = comment.content;
};
// 댓글 수정 취소
const cancelEdit = () => {
    editingCommentId.value = null;
    editedContent.value = '';
};

// 댓글 수정 API 호출
const updateComment = async (commentId, isDeleted) => {
    if (!editedContent.value.trim()) return;
    if (isDeleted) {
        const confirmed = window.confirm("정말 수정하시겠습니까? 수정 시 삭제가 취소됩니다.");
        if (!confirmed) return;
    } else {
        const confirmed = window.confirm("정말 수정하시겠습니까?");
        if (!confirmed) return;
    }


    try {
        await commentService.updateReviewComment(commentId, {
            content: editedContent.value
        });
        await fetchComments();
        editingCommentId.value = null;
        editedContent.value = '';
    } catch (err) {
        console.error("댓글 수정 실패:", err);
        alert(err.response.data.message);
    }
};

// 댓글 삭제(본인 댓글만 가능)
const deleteComment = async (commentId) => {
    const confirmed = window.confirm("정말로 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
        await commentService.deleteReviewComment(commentId);
        alert("댓글이 삭제되었습니다")
        await fetchComments();
    } catch (err) {
        console.error(" 댓글 삭제 실패:", err);
        alert(err.response.data.message);
    }
};


// 모달 열릴 때마다 리뷰/댓글 로드
watch(
    () => props.open,
    async (isOpen) => {
        if (isOpen && props.reviewId) {
            await fetchReviewDetail();
            await fetchComments();
        }
    }
);
</script>

<!--
[사용 예시]
<template>
<ReviewDetailModal
  :review-id="selectedReviewId"
  :open="showModal"
  @close="showModal = false"
/>
</template>
<script>
const showModal = ref(false);
const selectedReviewId = ref(null);

const openReviewDetail = (id) => {
  selectedReviewId.value = id;
  showModal.value = true;
};

</script>
-->
