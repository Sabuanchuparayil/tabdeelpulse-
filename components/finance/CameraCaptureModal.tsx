
import React, { useRef, useEffect, useState } from 'react';
import Modal from '../common/Modal';

interface CameraCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (dataUrl: string) => void;
}

const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({ isOpen, onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let stream: MediaStream | null = null;

        const startCamera = async () => {
            if (isOpen && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    setError(null);
                    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (err) {
                    console.error("Error accessing camera:", err);
                    setError("Could not access camera. Please check permissions.");
                }
            }
        };

        const stopCamera = () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if(videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };

        startCamera();

        return () => {
            stopCamera();
        };
    }, [isOpen]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                onCapture(dataUrl);
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Capture Document" size="lg">
            <div>
                {error ? (
                    <div className="text-red-500 bg-red-100 dark:bg-red-900/30 p-4 rounded-md">{error}</div>
                ) : (
                    <div className="relative">
                        <video ref={videoRef} autoPlay playsInline className="w-full rounded-md" />
                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                )}
                <div className="flex justify-center mt-4">
                    <button
                        onClick={handleCapture}
                        disabled={!!error}
                        className="bg-primary-light text-white px-6 py-3 rounded-full text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Capture
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default CameraCaptureModal;
