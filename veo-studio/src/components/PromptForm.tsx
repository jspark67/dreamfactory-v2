/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { Video } from '@google/genai';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createDirectorAgent } from '../services/agentFramework';
import {
    AspectRatio,
    GenerationMode,
    Resolution,
    VeoModel,
} from '../types';
import type {
    GenerateVideoParams,
    ImageFile,
    VideoFile,
} from '../types';
import {
    ArrowRightIcon,
    ChevronDownIcon,
    FilmIcon,
    FramesModeIcon,
    PlusIcon,
    RectangleStackIcon,
    ReferencesModeIcon,
    ScrollTextIcon,
    SlidersHorizontalIcon,
    SparklesIcon,
    TextModeIcon,
    TvIcon,
    Wand2Icon,
    XMarkIcon,
} from './icons';

const aspectRatioDisplayNames: Record<AspectRatio, string> = {
    [AspectRatio.LANDSCAPE]: 'Landscape (16:9)',
    [AspectRatio.PORTRAIT]: 'Portrait (9:16)',
};

const modeIcons: Record<GenerationMode, React.ReactNode> = {
    [GenerationMode.TEXT_TO_VIDEO]: <TextModeIcon className="w-5 h-5" />,
    [GenerationMode.FRAMES_TO_VIDEO]: <FramesModeIcon className="w-5 h-5" />,
    [GenerationMode.REFERENCES_TO_VIDEO]: (
        <ReferencesModeIcon className="w-5 h-5" />
    ),
    [GenerationMode.EXTEND_VIDEO]: <FilmIcon className="w-5 h-5" />,
};

const EXAMPLE_SCRIPT = `INT. SPACE - NIGHT

ALICE (8, wearing a spacesuit slightly too big for her) pokes at a floating marshmallow with a skewer. The RABBIT (in a tiny spacesuit), consults a star chart projected from his pocket watch. The blue Earth hangs in the distance, a serene marble against the black velvet. A sleek, silver SPACESHIP whizzes past, leaving a trail of glittering stardust.

ALICE
Is this marshmallow even cooking? It just keeps spinning.

RABBIT
(Without looking up)
Patience, my dear Alice. Space-mallows require a different sort of…temporal heating. Almost there. According to my calculations, we should be able to see the Andromeda galaxy soon, a truly spectacular sight!

Alice sighs, then notices the spaceship.

ALICE
Ooh! Look, Rabbit! A spaceship! I wonder where they're going?

RABBIT
(Peers up, adjusting his spectacles)
Hmm, a Galactic Cruiser, Mark IV. Likely headed for the Kepler-186f colony. A delightful little planet, though their tea is rather weak.

The Rabbit returns to his star chart. Alice watches the spaceship disappear into the inky blackness.

ALICE
I wish we could go to other planets.

RABBIT
(Chuckles)
My dear Alice, we ARE on another planet! Well, technically, an asteroid. But potato, po-tah-to, wouldn't you say?

Alice grins, finally getting the marshmallow close enough to a small heating element attached to her suit. It begins to toast.

ALICE
Almost ready!

RABBIT
Excellent! Just in time for our celestial bedtime story. Tonight, we shall delve into the mysteries of the Crab Nebula!`;

const fileToBase64 = <T extends { file: File; base64: string }>(
    file: File,
): Promise<T> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            if (base64) {
                resolve({ file, base64 } as T);
            } else {
                reject(new Error('Failed to read file as base64.'));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};
const fileToImageFile = (file: File): Promise<ImageFile> =>
    fileToBase64<ImageFile>(file);
const fileToVideoFile = (file: File): Promise<VideoFile> =>
    fileToBase64<VideoFile>(file);

const CustomSelect: React.FC<{
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    icon: React.ReactNode;
    children: React.ReactNode;
    disabled?: boolean;
}> = ({ label, value, onChange, icon, children, disabled = false }) => (
    <div>
        <label
            className={`text-xs block mb-1.5 font-medium ${disabled ? 'text-gray-500' : 'text-gray-400'
                }`}>
            {label}
        </label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                {icon}
            </div>
            <select
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="w-full bg-[#1f1f1f] border border-gray-600 rounded-lg pl-10 pr-8 py-2.5 appearance-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-700/50 disabled:border-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-gray-200">
                {children}
            </select>
            <ChevronDownIcon
                className={`w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${disabled ? 'text-gray-600' : 'text-gray-400'
                    }`}
            />
        </div>
    </div>
);

const ImageUpload: React.FC<{
    onSelect: (image: ImageFile) => void;
    onRemove?: () => void;
    image?: ImageFile | null;
    label: React.ReactNode;
}> = ({ onSelect, onRemove, image, label }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const imageFile = await fileToImageFile(file);
                onSelect(imageFile);
            } catch (error) {
                console.error('Error converting file:', error);
            }
        }
        // Reset input value to allow selecting the same file again
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    if (image) {
        return (
            <div className="relative w-28 h-20 group">
                <img
                    src={URL.createObjectURL(image.file)}
                    alt="preview"
                    className="w-full h-full object-cover rounded-lg"
                />
                <button
                    type="button"
                    onClick={onRemove}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image">
                    <XMarkIcon className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-28 h-20 bg-gray-700/50 hover:bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors">
            <PlusIcon className="w-6 h-6" />
            <span className="text-xs mt-1">{label}</span>
            <input
                type="file"
                ref={inputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
        </button>
    );
};

const VideoUpload: React.FC<{
    onSelect: (video: VideoFile) => void;
    onRemove?: () => void;
    video?: VideoFile | null;
    label: React.ReactNode;
}> = ({ onSelect, onRemove, video, label }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const videoFile = await fileToVideoFile(file);
                onSelect(videoFile);
            } catch (error) {
                console.error('Error converting file:', error);
            }
        }
    };

    if (video) {
        return (
            <div className="relative w-48 h-28 group">
                <video
                    src={URL.createObjectURL(video.file)}
                    className="w-full h-full object-cover rounded-lg bg-black"
                    controls={false}
                    muted
                    loop
                    autoPlay
                />
                <button
                    type="button"
                    onClick={onRemove}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove video">
                    <XMarkIcon className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-48 h-28 bg-gray-700/50 hover:bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors">
            <FilmIcon className="w-6 h-6" />
            <span className="text-xs mt-1">{label}</span>
            <input
                type="file"
                ref={inputRef}
                onChange={handleFileChange}
                accept="video/mp4"
                className="hidden"
            />
        </button>
    );
};

interface PromptFormProps {
    onGenerate: (params: GenerateVideoParams) => void;
    initialValues?: GenerateVideoParams | null;
}

const PromptForm: React.FC<PromptFormProps> = ({ onGenerate, initialValues }) => {
    const [model, setModel] = useState<VeoModel>(VeoModel.VEO);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>(
        AspectRatio.LANDSCAPE,
    );
    const [resolution, setResolution] = useState<Resolution>(Resolution.P720);
    const [mode, setMode] = useState<GenerationMode>(
        GenerationMode.TEXT_TO_VIDEO,
    );
    const [prompt, setPrompt] = useState('');
    const [startFrame, setStartFrame] = useState<ImageFile | null>(null);
    const [endFrame, setEndFrame] = useState<ImageFile | null>(null);
    const [referenceImages, setReferenceImages] = useState<ImageFile[]>([]);
    const [styleImage, setStyleImage] = useState<ImageFile | null>(null);
    const [inputVideo, setInputVideo] = useState<VideoFile | null>(null);
    const [inputVideoObject, setInputVideoObject] = useState<Video | null>(null);
    const [isLooping, setIsLooping] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);

    useEffect(() => {
        if (initialValues) {
            setModel(initialValues.model);
            setAspectRatio(initialValues.aspectRatio);
            setResolution(initialValues.resolution);
            setMode(initialValues.mode);
            setPrompt(initialValues.prompt);
            setStartFrame(initialValues.startFrame || null);
            setEndFrame(initialValues.endFrame || null);
            setReferenceImages(initialValues.referenceImages || []);
            setStyleImage(initialValues.styleImage || null);
            setInputVideo(initialValues.inputVideo || null);
            setInputVideoObject(initialValues.inputVideoObject || null);
            setIsLooping(initialValues.isLooping || false);
        }
    }, [initialValues]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate({
            model,
            aspectRatio,
            resolution,
            mode,
            prompt,
            startFrame,
            endFrame,
            referenceImages,
            styleImage,
            inputVideo,
            inputVideoObject,
            isLooping,
        });
    };

    const handleModeChange = (newMode: GenerationMode) => {
        setMode(newMode);
        // Reset specific fields if needed when switching modes
        if (newMode === GenerationMode.FRAMES_TO_VIDEO) {
            setModel(VeoModel.VEO_FAST); // Frames mode often works well with Fast
        }
    };

    const insertExampleScript = () => {
        setPrompt(EXAMPLE_SCRIPT);
    };

    const handleEnhancePrompt = async () => {
        if (!prompt.trim()) return;

        setIsEnhancing(true);
        try {
            // Use the Director Agent to enhance the prompt
            const director = createDirectorAgent();
            // Changed from process() to run() to match the new Agent class
            const enhancedPrompt = await director.run(prompt);
            setPrompt(enhancedPrompt);
        } catch (error) {
            console.error('Failed to enhance prompt:', error);
            // Optional: Add UI feedback for error
        } finally {
            setIsEnhancing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-wrap gap-2 justify-center mb-6">
                {Object.values(GenerationMode)
                    .filter((m) => m !== GenerationMode.EXTEND_VIDEO) // Extend is triggered from result
                    .map((m) => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => handleModeChange(m)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${mode === m
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}>
                            {modeIcons[m]}
                            {m}
                        </button>
                    ))}
                {mode === GenerationMode.EXTEND_VIDEO && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-indigo-600 text-white cursor-default">
                        {modeIcons[GenerationMode.EXTEND_VIDEO]}
                        {GenerationMode.EXTEND_VIDEO}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CustomSelect
                    label="Model"
                    value={model}
                    onChange={(e) => setModel(e.target.value as VeoModel)}
                    icon={<SparklesIcon className="w-4 h-4 text-gray-400" />}>
                    <option value={VeoModel.VEO_FAST}>Veo Fast (Preview)</option>
                    <option value={VeoModel.VEO}>Veo (High Quality)</option>
                </CustomSelect>

                <CustomSelect
                    label="Aspect Ratio"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                    disabled={mode === GenerationMode.EXTEND_VIDEO}
                    icon={<TvIcon className="w-4 h-4 text-gray-400" />}>
                    {Object.entries(aspectRatioDisplayNames).map(([key, name]) => (
                        <option key={key} value={key}>
                            {name}
                        </option>
                    ))}
                </CustomSelect>

                <CustomSelect
                    label="Resolution"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value as Resolution)}
                    disabled={mode === GenerationMode.EXTEND_VIDEO} // Extend is locked to 720p usually
                    icon={<SlidersHorizontalIcon className="w-4 h-4 text-gray-400" />}>
                    <option value={Resolution.P720}>720p</option>
                    <option value={Resolution.P1080}>1080p</option>
                </CustomSelect>
            </div>

            {mode === GenerationMode.FRAMES_TO_VIDEO && (
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 space-y-4">
                    <h3 className="text-sm font-medium text-gray-300">Frames</h3>
                    <div className="flex flex-wrap gap-4">
                        <ImageUpload
                            label="Start Frame"
                            image={startFrame}
                            onSelect={setStartFrame}
                            onRemove={() => setStartFrame(null)}
                        />
                        {!isLooping && (
                            <ImageUpload
                                label="End Frame"
                                image={endFrame}
                                onSelect={setEndFrame}
                                onRemove={() => setEndFrame(null)}
                            />
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="looping"
                            checked={isLooping}
                            onChange={(e) => setIsLooping(e.target.checked)}
                            className="rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="looping" className="text-sm text-gray-300">
                            Create a looping video (Start Frame = End Frame)
                        </label>
                    </div>
                </div>
            )}

            {mode === GenerationMode.REFERENCES_TO_VIDEO && (
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 space-y-4">
                    <h3 className="text-sm font-medium text-gray-300">
                        References (Max 3)
                    </h3>
                    <div className="flex flex-wrap gap-4">
                        {referenceImages.map((img, idx) => (
                            <ImageUpload
                                key={idx}
                                label={`Ref ${idx + 1}`}
                                image={img}
                                onSelect={(newImg) => {
                                    const newRefs = [...referenceImages];
                                    newRefs[idx] = newImg;
                                    setReferenceImages(newRefs);
                                }}
                                onRemove={() => {
                                    const newRefs = referenceImages.filter((_, i) => i !== idx);
                                    setReferenceImages(newRefs);
                                }}
                            />
                        ))}
                        {referenceImages.length < 3 && (
                            <ImageUpload
                                label="Add Ref"
                                onSelect={(newImg) =>
                                    setReferenceImages([...referenceImages, newImg])
                                }
                            />
                        )}
                    </div>

                    <h3 className="text-sm font-medium text-gray-300 pt-2">
                        Style Reference
                    </h3>
                    <div className="flex gap-4">
                        <ImageUpload
                            label="Style Image"
                            image={styleImage}
                            onSelect={setStyleImage}
                            onRemove={() => setStyleImage(null)}
                        />
                    </div>
                </div>
            )}

            {mode === GenerationMode.EXTEND_VIDEO && inputVideo && (
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 space-y-4">
                    <h3 className="text-sm font-medium text-gray-300">Video to Extend</h3>
                    <VideoUpload
                        label="Input Video"
                        video={inputVideo}
                        onSelect={setInputVideo} // Generally readonly in this flow but ok to replace
                        onRemove={() => setInputVideo(null)}
                    />
                </div>
            )}

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-300">Prompt</label>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleEnhancePrompt}
                            disabled={isEnhancing || !prompt}
                            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {isEnhancing ? (
                                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Wand2Icon className="w-3.5 h-3.5" />
                            )}
                            Enhance with Agent
                        </button>
                        <button
                            type="button"
                            onClick={insertExampleScript}
                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-300 transition-colors">
                            <ScrollTextIcon className="w-3.5 h-3.5" />
                            Insert Script
                        </button>
                    </div>
                </div>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your video..."
                    className="w-full h-32 bg-[#1f1f1f] border border-gray-600 rounded-lg p-4 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-gray-200 placeholder-gray-500 text-sm leading-relaxed"
                />
            </div>

            <button
                type="submit"
                disabled={!prompt && mode !== GenerationMode.FRAMES_TO_VIDEO} // Frames mode might not strictly require prompt if frames are provided, but API usually wants one.
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20">
                <SparklesIcon className="w-5 h-5" />
                Generate Video
                <ArrowRightIcon className="w-5 h-5" />
            </button>
        </form>
    );
};

export default PromptForm;