import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, X, Image as ImageIcon } from 'lucide-react';
import { useCamera } from '../../hooks/useCamera';

export default function ImageUploader({ onImageSelect, accept = 'image/*' }) {
    const [preview, setPreview] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const { videoRef, canvasRef, stream, startCamera, capturePhoto, stopCamera, dataURLtoFile } = useCamera();

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setPreview(reader.result);
            onImageSelect(file, reader.result);
        };
        reader.readAsDataURL(file);
    }, [onImageSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
        maxFiles: 1,
        multiple: false,
    });

    const handleCameraCapture = () => {
        const dataUrl = capturePhoto();
        if (dataUrl) {
            const file = dataURLtoFile(dataUrl);
            setPreview(dataUrl);
            onImageSelect(file, dataUrl);
            setShowCamera(false);
        }
    };

    const handleOpenCamera = async () => {
        setShowCamera(true);
        await startCamera();
    };

    const clearPreview = () => {
        setPreview(null);
        if (stream) stopCamera();
        setShowCamera(false);
    };

    return (
        <div className="space-y-4">
            <AnimatePresence mode="wait">
                {preview ? (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative rounded-lg overflow-hidden border border-farm-border"
                    >
                        <img src={preview} alt="Preview" className="w-full max-h-[400px] object-contain bg-farm-bg" />
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={clearPreview}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-farm-bg/80 backdrop-blur flex items-center justify-center text-farm-text hover:bg-farm-danger/80 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </motion.button>
                    </motion.div>
                ) : showCamera ? (
                    <motion.div
                        key="camera"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative rounded-lg overflow-hidden border border-farm-border"
                    >
                        <video ref={videoRef} autoPlay playsInline className="w-full max-h-[400px] object-cover" />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleCameraCapture}
                                className="w-16 h-16 rounded-full bg-farm-accent flex items-center justify-center shadow-lg shadow-farm-accent/30"
                            >
                                <Camera className="w-7 h-7 text-farm-bg" />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={clearPreview}
                                className="w-12 h-12 rounded-full bg-farm-bg/80 backdrop-blur flex items-center justify-center"
                            >
                                <X className="w-5 h-5 text-farm-text" />
                            </motion.button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div
                            {...getRootProps()}
                            className={`relative cursor-pointer border-2 border-dashed rounded-lg p-12 text-center transition-all ${isDragActive
                                    ? 'border-farm-accent bg-farm-accent/5'
                                    : 'border-farm-border hover:border-farm-accent/50 animate-pulse-border'
                                }`}
                        >
                            <input {...getInputProps()} />
                            <motion.div
                                animate={{ y: isDragActive ? -8 : 0 }}
                                className="flex flex-col items-center gap-4"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-farm-accent/10 flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-farm-accent" />
                                </div>
                                <div>
                                    <p className="text-farm-text font-medium font-dm">
                                        {isDragActive ? 'Drop your image here' : 'Drag & drop or click to upload'}
                                    </p>
                                    <p className="text-sm text-farm-text-muted mt-1">Supports JPG, PNG, WebP</p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Camera Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleOpenCamera}
                            className="mt-4 w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg border border-farm-border hover:border-farm-accent/50 text-farm-text-secondary hover:text-farm-accent transition-all"
                        >
                            <Camera className="w-5 h-5" />
                            <span className="font-dm text-sm">Open Camera</span>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
