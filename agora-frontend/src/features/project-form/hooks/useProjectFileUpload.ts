import React, { useRef, useState } from 'react';
import api from '@/api/axios';

export const useProjectFileUpload = () => {
  const [fileUrl, setFileUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  const [imageUrl, setImageUrl] = useState('');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleCoverFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('Imagem deve ser JPG, PNG ou WEBP.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setCropSrc(e.target?.result as string);
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleCropConfirm = async (blob: Blob) => {
    setCropSrc(null);
    const previewUrl = URL.createObjectURL(blob);
    setCoverPreview(previewUrl);
    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', blob, 'cover.jpg');
      const response = await api.post('/uploads/project-cover', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUrl(response.data.url ?? '');
    } catch {
      setUploadError('Não foi possível enviar a imagem de capa.');
      setCoverPreview(null);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError('');
    if (file.type !== 'application/pdf') {
      setUploadError('Envie apenas PDF.');
      return;
    }
    if (file.size > 20_000_000) {
      setUploadError('Arquivo acima de 20MB.');
      return;
    }
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/uploads/project-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFileUrl(response.data.url ?? '');
      setUploadedFileName(response.data.fileName ?? file.name);
    } catch {
      setUploadError('Nao foi possivel enviar o arquivo.');
    } finally {
      setIsUploading(false);
    }
  };

  return {
    fileUrl,
    setFileUrl,
    isUploading,
    uploadError,
    setUploadError,
    uploadedFileName,
    imageUrl,
    setImageUrl,
    coverPreview,
    setCoverPreview,
    cropSrc,
    setCropSrc,
    isUploadingCover,
    coverInputRef,
    handleCoverFileSelected,
    handleCropConfirm,
    handleFileUpload,
  };
};
