'use client';

import { useState, useRef, useCallback } from 'react';
import { Image as ImageIcon, Video, X, Plus, GripVertical, Upload, Link, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

interface MediaUploadProps {
  images: string[];
  videos: string[];
  onImagesChange: (images: string[]) => void;
  onVideosChange: (videos: string[]) => void;
}

export function MediaUpload({ images, videos, onImagesChange, onVideosChange }: MediaUploadProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle drag start
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);
    onImagesChange(newImages);
    setDraggedIndex(index);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Add image
  const handleAddImage = () => {
    if (urlInput.trim()) {
      onImagesChange([...images, urlInput.trim()]);
      setUrlInput('');
      setAddDialogOpen(false);
    }
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    if (activeImageIndex >= newImages.length) {
      setActiveImageIndex(Math.max(0, newImages.length - 1));
    }
  };

  // Add video
  const handleAddVideo = () => {
    if (urlInput.trim()) {
      onVideosChange([...videos, urlInput.trim()]);
      setUrlInput('');
      setAddDialogOpen(false);
    }
  };

  // Remove video
  const handleRemoveVideo = (index: number) => {
    const newVideos = videos.filter((_, i) => i !== index);
    onVideosChange(newVideos);
    if (activeVideoIndex >= newVideos.length) {
      setActiveVideoIndex(Math.max(0, newVideos.length - 1));
    }
  };

  // Generate AI image
  const handleGenerateImage = async (prompt: string) => {
    try {
      // This would call an AI image generation API
      console.log('Generating image for:', prompt);
      // For now, just use placeholder
      const placeholderUrl = `https://picsum.photos/800/800?random=${Date.now()}`;
      onImagesChange([...images, placeholderUrl]);
      setAddDialogOpen(false);
    } catch (error) {
      console.error('Failed to generate image:', error);
    }
  };

  // Move image
  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
    
    const newImages = [...images];
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    onImagesChange(newImages);
    setActiveImageIndex(newIndex);
  };

  // Move video
  const moveVideo = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= videos.length) return;
    
    const newVideos = [...videos];
    [newVideos[index], newVideos[newIndex]] = [newVideos[newIndex], newVideos[index]];
    onVideosChange(newVideos);
    setActiveVideoIndex(newIndex);
  };

  // Toggle video play/pause
  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="space-y-6">
      {/* Images Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-amber-600" />
            Product Images ({images.length})
          </Label>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" onClick={() => setUrlInput('')}>
                <Plus className="h-4 w-4 mr-1" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Image</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Tabs defaultValue="url">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url">URL</TabsTrigger>
                    <TabsTrigger value="generate">AI Generate</TabsTrigger>
                  </TabsList>
                  <TabsContent value="url" className="space-y-4">
                    <div>
                      <Label>Image URL</Label>
                      <Input
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="mt-1"
                      />
                    </div>
                    <Button onClick={handleAddImage} disabled={!urlInput.trim()}>
                      Add Image
                    </Button>
                  </TabsContent>
                  <TabsContent value="generate" className="space-y-4">
                    <div>
                      <Label>Describe the image</Label>
                      <Input
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="A modern home decor lamp..."
                        className="mt-1"
                      />
                    </div>
                    <Button onClick={() => handleGenerateImage(urlInput)} disabled={!urlInput.trim()}>
                      Generate Image
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Image Preview with Slider */}
        {images.length > 0 && (
          <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border">
            <Image
              src={images[activeImageIndex]}
              alt={`Product image ${activeImageIndex + 1}`}
              fill
              className="object-cover"
            />
            
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => moveImage(activeImageIndex, 'left')}
                  disabled={activeImageIndex === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(activeImageIndex, 'right')}
                  disabled={activeImageIndex === images.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
            
            {/* Image Counter */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {activeImageIndex + 1} / {images.length}
            </div>
            
            {/* Remove Button */}
            <button
              type="button"
              onClick={() => handleRemoveImage(activeImageIndex)}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg"
            >
              <X className="h-4 w-4" />
            </button>
            
            {/* Primary Badge */}
            {activeImageIndex === 0 && (
              <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                Primary
              </div>
            )}
          </div>
        )}

        {/* Thumbnail Strip */}
        {images.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <div
                key={index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => setActiveImageIndex(index)}
                className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                  index === activeImageIndex
                    ? 'border-amber-500 ring-2 ring-amber-200'
                    : 'border-gray-200 hover:border-gray-300'
                } ${draggedIndex === index ? 'opacity-50' : ''}`}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors">
                  <GripVertical className="h-4 w-4 text-white opacity-0 hover:opacity-100" />
                </div>
                {index === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-amber-500 text-white text-[10px] text-center py-0.5">
                    Primary
                  </div>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setAddDialogOpen(true)}
              className="flex-shrink-0 w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-amber-400 hover:bg-amber-50 transition-colors"
            >
              <Plus className="h-6 w-6 text-gray-400" />
            </button>
          </div>
        )}

        {/* Empty State */}
        {images.length === 0 && (
          <div
            onClick={() => setAddDialogOpen(true)}
            className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors"
          >
            <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-500">Click to add images</p>
            <p className="text-gray-400 text-sm">or drag and drop</p>
          </div>
        )}
      </div>

      {/* Videos Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Video className="h-5 w-5 text-purple-600" />
            Product Videos ({videos.length})
          </Label>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" onClick={() => setUrlInput('')}>
                <Plus className="h-4 w-4 mr-1" />
                Add Video
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Video</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Video URL</Label>
                  <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/video.mp4"
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleAddVideo} disabled={!urlInput.trim()}>
                  Add Video
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Video Preview */}
        {videos.length > 0 && (
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden border">
            <video
              ref={videoRef}
              src={videos[activeVideoIndex]}
              className="w-full h-full object-cover"
              onEnded={() => setIsPlaying(false)}
            />
            
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={toggleVideoPlay}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-12 w-12 text-white" />
              ) : (
                <Play className="h-12 w-12 text-white" />
              )}
            </button>
            
            {/* Navigation Arrows */}
            {videos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => moveVideo(activeVideoIndex, 'left')}
                  disabled={activeVideoIndex === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveVideo(activeVideoIndex, 'right')}
                  disabled={activeVideoIndex === videos.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
            
            {/* Video Counter */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {activeVideoIndex + 1} / {videos.length}
            </div>
            
            {/* Remove Button */}
            <button
              type="button"
              onClick={() => handleRemoveVideo(activeVideoIndex)}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Video Thumbnails */}
        {videos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {videos.map((video, index) => (
              <div
                key={index}
                onClick={() => setActiveVideoIndex(index)}
                className={`relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                  index === activeVideoIndex
                    ? 'border-purple-500 ring-2 ring-purple-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <video
                  src={video}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="h-4 w-4 text-white" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {videos.length === 0 && (
          <div
            onClick={() => setAddDialogOpen(true)}
            className="aspect-video border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors"
          >
            <Video className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-500">Click to add videos</p>
            <p className="text-gray-400 text-sm">MP4, WebM supported</p>
          </div>
        )}
      </div>
    </div>
  );
}
