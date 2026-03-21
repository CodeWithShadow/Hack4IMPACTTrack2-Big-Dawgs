import { useState, useRef, useCallback } from 'react';

export function useCamera() {
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [error, setError] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const startCamera = useCallback(async (facingMode = 'environment') => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.play();
            }
            setError(null);
        } catch (err) {
            setError('Camera access denied or unavailable.');
        }
    }, []);

    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return null;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
        stopCamera();
        return dataUrl;
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    const dataURLtoFile = useCallback((dataUrl, filename = 'capture.jpg') => {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new File([u8arr], filename, { type: mime });
    }, []);

    return {
        videoRef,
        canvasRef,
        stream,
        capturedImage,
        error,
        startCamera,
        capturePhoto,
        stopCamera,
        setCapturedImage,
        dataURLtoFile,
    };
}
