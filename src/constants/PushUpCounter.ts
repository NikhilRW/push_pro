import { Dimensions } from 'react-native';

export const { height, width } = Dimensions.get('window');

// Constants for Progressive Movement Analysis (can stay as regular variables)
export const BUFFER_SIZE = 40; // Increased to handle face disappearance periods
export const MIN_MOVEMENT_RANGE = 25; // Minimum Y range for valid pushup
export const PATTERN_CONFIDENCE_THRESHOLD = 0.75; // How confident we need to be in pattern
export const ANALYSIS_INTERVAL = 200; // Analyze pattern every 200ms to avoid overprocessing
export const MAX_FACE_GONE_TIME = 2000; // Max time face can be gone before reset (2 seconds)

export const VOICES = Object.freeze({
  af_heart: {
    name: 'Heart',
    language: 'en-us',
    gender: 'Female',
    traits: '❤️',
    targetQuality: 'A',
    overallGrade: 'A',
  },
  af_alloy: {
    name: 'Alloy',
    language: 'en-us',
    gender: 'Female',
    targetQuality: 'B',
    overallGrade: 'C',
  },
  af_aoede: {
    name: 'Aoede',
    language: 'en-us',
    gender: 'Female',
    targetQuality: 'B',
    overallGrade: 'C+',
  },
  af_bella: {
    name: 'Bella',
    language: 'en-us',
    gender: 'Female',
    traits: '🔥',
    targetQuality: 'A',
    overallGrade: 'A-',
  },
  af_jessica: {
    name: 'Jessica',
    language: 'en-us',
    gender: 'Female',
    targetQuality: 'C',
    overallGrade: 'D',
  },
  af_kore: {
    name: 'Kore',
    language: 'en-us',
    gender: 'Female',
    targetQuality: 'B',
    overallGrade: 'C+',
  },
  af_nicole: {
    name: 'Nicole',
    language: 'en-us',
    gender: 'Female',
    traits: '🎧',
    targetQuality: 'B',
    overallGrade: 'B-',
  },
  af_nova: {
    name: 'Nova',
    language: 'en-us',
    gender: 'Female',
    targetQuality: 'B',
    overallGrade: 'C',
  },
  af_river: {
    name: 'River',
    language: 'en-us',
    gender: 'Female',
    targetQuality: 'C',
    overallGrade: 'D',
  },
  af_sarah: {
    name: 'Sarah',
    language: 'en-us',
    gender: 'Female',
    targetQuality: 'B',
    overallGrade: 'C+',
  },
  af_sky: {
    name: 'Sky',
    language: 'en-us',
    gender: 'Female',
    targetQuality: 'B',
    overallGrade: 'C-',
  },
  am_adam: {
    name: 'Adam',
    language: 'en-us',
    gender: 'Male',
    targetQuality: 'D',
    overallGrade: 'F+',
  },
  am_echo: {
    name: 'Echo',
    language: 'en-us',
    gender: 'Male',
    targetQuality: 'C',
    overallGrade: 'D',
  },
  am_eric: {
    name: 'Eric',
    language: 'en-us',
    gender: 'Male',
    targetQuality: 'C',
    overallGrade: 'D',
  },
  am_fenrir: {
    name: 'Fenrir',
    language: 'en-us',
    gender: 'Male',
    targetQuality: 'B',
    overallGrade: 'C+',
  },
  am_liam: {
    name: 'Liam',
    language: 'en-us',
    gender: 'Male',
    targetQuality: 'C',
    overallGrade: 'D',
  },
  am_michael: {
    name: 'Michael',
    language: 'en-us',
    gender: 'Male',
    targetQuality: 'B',
    overallGrade: 'C+',
  },
  am_onyx: {
    name: 'Onyx',
    language: 'en-us',
    gender: 'Male',
    targetQuality: 'C',
    overallGrade: 'D',
  },
  am_puck: {
    name: 'Puck',
    language: 'en-us',
    gender: 'Male',
    targetQuality: 'B',
    overallGrade: 'C+',
  },
  am_santa: {
    name: 'Santa',
    language: 'en-us',
    gender: 'Male',
    targetQuality: 'C',
    overallGrade: 'D-',
  },
  bf_emma: {
    name: 'Emma',
    language: 'en-gb',
    gender: 'Female',
    traits: '🚺',
    targetQuality: 'B',
    overallGrade: 'B-',
  },
  bf_isabella: {
    name: 'Isabella',
    language: 'en-gb',
    gender: 'Female',
    targetQuality: 'B',
    overallGrade: 'C',
  },
  bm_george: {
    name: 'George',
    language: 'en-gb',
    gender: 'Male',
    targetQuality: 'B',
    overallGrade: 'C',
  },
  bm_lewis: {
    name: 'Lewis',
    language: 'en-gb',
    gender: 'Male',
    targetQuality: 'C',
    overallGrade: 'D+',
  },
  bf_alice: {
    name: 'Alice',
    language: 'en-gb',
    gender: 'Female',
    traits: '🚺',
    targetQuality: 'C',
    overallGrade: 'D',
  },
  bf_lily: {
    name: 'Lily',
    language: 'en-gb',
    gender: 'Female',
    traits: '🚺',
    targetQuality: 'C',
    overallGrade: 'D',
  },
  bm_daniel: {
    name: 'Daniel',
    language: 'en-gb',
    gender: 'Male',
    traits: '🚹',
    targetQuality: 'C',
    overallGrade: 'D',
  },
  bm_fable: {
    name: 'Fable',
    language: 'en-gb',
    gender: 'Male',
    traits: '🚹',
    targetQuality: 'B',
    overallGrade: 'C',
  },
});

export const VOICE_DATA_URL =
  'https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/voices';

// Model options with their sizes and descriptions
const MODEL_BASE_URL =
  'https://huggingface.co/onnx-community/Kokoro-82M-ONNX/resolve/main/onnx';
export const MODELS = Object.freeze({
  'model.onnx': {
    name: 'Full Precision',
    size: '326 MB',
    description: 'Highest quality, largest size',
    url: `${MODEL_BASE_URL}/model.onnx`,
  },
  'model_fp16.onnx': {
    name: 'FP16',
    size: '163 MB',
    description: 'High quality, reduced size',
    url: `${MODEL_BASE_URL}/model_fp16.onnx`,
  },
  'model_q4.onnx': {
    name: 'Q4',
    size: '305 MB',
    description: 'Good quality, slightly reduced size',
    url: `${MODEL_BASE_URL}/model_q4.onnx`,
  },
  'model_q4f16.onnx': {
    name: 'Q4F16',
    size: '154 MB',
    description: 'Good quality, smaller size',
    url: `${MODEL_BASE_URL}/model_q4f16.onnx`,
  },
  'model_q8f16.onnx': {
    name: 'Q8F16',
    size: '86 MB',
    description: 'Balanced quality and size',
    url: `${MODEL_BASE_URL}/model_q8f16.onnx`,
  },
  'model_quantized.onnx': {
    name: 'Quantized',
    size: '92.4 MB',
    description: 'Reduced quality, smaller size',
    url: `${MODEL_BASE_URL}/model_quantized.onnx`,
  },
  'model_uint8.onnx': {
    name: 'UINT8',
    size: '177 MB',
    description: 'Lower quality, reduced size',
    url: `${MODEL_BASE_URL}/model_uint8.onnx`,
  },
  'model_uint8f16.onnx': {
    name: 'UINT8F16',
    size: '177 MB',
    description: 'Lower quality, reduced size',
    url: `${MODEL_BASE_URL}/model_uint8f16.onnx`,
  },
});

export const DEFAULT_VOICE_ID = 'am_onyx';
export const DEFAULT_MODEL = 'model.onnx';