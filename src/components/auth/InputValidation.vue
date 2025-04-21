<template>
    <div class="input-wrapper">
        <label :for="id">{{ label }}</label>
        <div class="input-group">
            <input :id="id" :type="type" :value="modelValue" @input="handleInput" :required="required" />
            <button v-if="showCheckButton && !isChecked && isValid" type="button" @click="emit('check')"
                :disabled="!isValid || isChecked">
                중복 확인
            </button>
        </div>
        <p v-if="message" :class="{ error: !isValid, success: isValid }">
            {{ message }}
        </p>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { defineProps, defineEmits } from 'vue';

// defineProps와 defineEmits는 <script setup>에서 자동으로 사용 가능
const props = defineProps({
    modelValue: String,
    id: String,
    label: String,
    type: {
        type: String,
        default: 'text',
    },
    required: Boolean,
    validate: Function,
    showCheckButton: Boolean,
    isChecked: Boolean,
});

const emit = defineEmits(['update:modelValue', 'check']);

const isValid = ref(false);
const message = ref('');

const handleInput = (event) => {
    // modelValue 업데이트 이벤트 발생
    emit('update:modelValue', event.target.value);

    // 유효성 검사 실행
    if (props.validate) {
        const result = props.validate(props.modelValue);
        isValid.value = result.isValid;
        message.value = result.message;
    }
};
</script>

<style scoped>
.input-wrapper {
    margin-bottom: 1rem;
}

.input-group {
    display: flex;
    gap: 0.5rem;
}

.input-group input {
    flex: 1;
}

.input-group button {
    width: auto;
    padding: 8px 16px;
}

label {
    display: block;
    margin-bottom: 4px;
}

input {
    width: 100%;
    padding: 8px;
}

.error {
    color: red;
    font-size: 0.9rem;
    margin-top: 4px;
}

.success {
    color: green;
    font-size: 0.9rem;
    margin-top: 4px;
}
</style>