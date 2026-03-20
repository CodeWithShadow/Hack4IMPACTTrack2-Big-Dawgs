import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import PageWrapper, { staggerContainer, staggerItem } from '../components/layout/PageWrapper';
import ImageUploader from '../components/ui/ImageUploader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DiseaseResult from '../components/disease/DiseaseResult';
import useStore from '../store/useStore';
import { analyzeDisease } from '../services/plantDiseaseService';
import { saveDiseaseAnalysis, uploadCropImage } from '../services/supabase';
import { getCropFromDisease, isHealthy } from '../utils/diseaseClasses';
import { useOffline } from '../hooks/useOffline';

export default function DiseaseDetection() {
    const { user, diseaseResult, diseaseLoading, setDiseaseResult, setDiseaseLoading, clearDiseaseResult } = useStore();
    const { isOnline, saveForSync } = useOffline();
    const [imageSrc, setImageSrc] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [heatmapSrc, setHeatmapSrc] = useState(null);
    const [treatmentText, setTreatmentText] = useState('');
    const [progressText, setProgressText] = useState('');
    const imgRef = useRef(null);

    const handleImageSelect = (file, dataUrl) => {
        setImageFile(file);
        setImageSrc(dataUrl);
        clearDiseaseResult();
        setHeatmapSrc(null);
        setTreatmentText('');
    };

    const handleAnalyze = async () => {
        if (!imageSrc) return;
        setDiseaseLoading(true);
        setTreatmentText('');
        setProgressText('Preparing image...');

        try {
            // Run plant disease classification
            const result = await analyzeDisease(imageSrc, (progress) => {
                setProgressText(progress);
            });
            setDiseaseResult(result);
            setTreatmentText(result.treatment || '');
            setProgressText('');

            // Save to Supabase
            if (user) {
                const analysisData = {
                    user_id: user.id,
                    disease_name: result.topPrediction.className,
                    confidence: result.topPrediction.confidence,
                    is_healthy: result.isHealthy,
                    top_predictions: result.allPredictions,
                    created_at: new Date().toISOString(),
                };

                if (isOnline) {
                    try {
                        if (imageFile) {
                            const imageUrl = await uploadCropImage(user.id, imageFile);
                            analysisData.image_url = imageUrl;
                        }
                        await saveDiseaseAnalysis(analysisData);
                    } catch (err) { console.error('Save error:', err); }
                } else {
                    saveForSync('disease_analysis', analysisData);
                }
            }
        } catch (err) {
            console.error('Analysis error:', err);
            setProgressText('');
            alert(`Analysis failed: ${err.message}\n\nPlease try again or use a clearer image.`);
            setDiseaseLoading(false);
        }
    };

    return (
        <PageWrapper>
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="max-w-4xl mx-auto space-y-8"
            >
                {/* Header */}
                <motion.div variants={staggerItem} className="space-y-1">
                    <p className="text-sm text-farm-text-muted font-mono uppercase tracking-widest">AI Analysis</p>
                    <h1 className="font-syne font-extrabold text-4xl md:text-5xl text-farm-text">
                        Crop Disease<br />
                        <span className="text-farm-accent">Detection</span>
                    </h1>
                    <p className="text-farm-text-muted font-dm mt-2 max-w-xl">
                        Upload or capture a photo of your crop leaf. Our AI model runs entirely in your browser — no internet needed after the first load.
                    </p>
                </motion.div>

                {/* Upload */}
                <motion.div variants={staggerItem}>
                    <ImageUploader onImageSelect={handleImageSelect} />
                </motion.div>

                {/* Analyze Button */}
                {imageSrc && !diseaseResult && (
                    <motion.div variants={staggerItem}>
                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(74,222,128,0.2)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAnalyze}
                            disabled={diseaseLoading}
                            className="w-full py-4 bg-farm-accent text-farm-bg font-syne font-bold text-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                        >
                            {diseaseLoading ? (
                                <LoadingSpinner text={progressText || 'Analyzing leaf patterns...'} size="sm" />
                            ) : (
                                'Analyze with AI'
                            )}
                        </motion.button>
                    </motion.div>
                )}

                {/* Loading */}
                {diseaseLoading && !diseaseResult && (
                    <motion.div variants={staggerItem}>
                        <LoadingSpinner text={progressText || 'Running AI classification model...'} />
                    </motion.div>
                )}

                {/* Result */}
                {diseaseResult && (
                    <DiseaseResult
                        result={diseaseResult}
                        imageSrc={imageSrc}
                        heatmapSrc={heatmapSrc}
                        treatmentText={treatmentText}
                    />
                )}
            </motion.div>
        </PageWrapper>
    );
}
