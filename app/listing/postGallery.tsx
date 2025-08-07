// components/ListingGallery.tsx
import React from 'react';

interface ListingGalleryProps {
    images: string[];
    mainImage: string;
    setMainImage: (image: string) => void;
    title: string;
}

const ListingGallery: React.FC<ListingGalleryProps> = ({ images, mainImage, setMainImage, title }) => {
    return (
        <div className="mb-8">
            {mainImage && (
                <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg mb-4">
                    <img
                        src={mainImage}
                        alt={title || 'Listing main image'}
                        className="w-full h-full object-cover"
                        width={1200}
                        height={500}
                    />
                </div>
            )}
            <div className="flex flex-wrap gap-4 justify-center">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className={`w-24 h-24 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${mainImage === image ? 'border-forest ring-2 ring-forest' : 'border-gray-200 hover:border-gray-400'}`}
                        onClick={() => setMainImage(image)}
                    >
                        <img
                            src={image}
                            alt={`Listing thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            width={96}
                            height={96}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ListingGallery;