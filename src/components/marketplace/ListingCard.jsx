import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Tag, User, Sparkles } from 'lucide-react';

export default function ListingCard({ listing, index = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            whileHover={{ y: -4, boxShadow: '0 0 30px rgba(74, 222, 128, 0.1)' }}
            className="bg-farm-card border border-farm-border/50 rounded-lg overflow-hidden group cursor-pointer"
        >
            {/* Image */}
            <div className="relative h-40 bg-farm-bg overflow-hidden">
                {listing.image_url ? (
                    <img
                        src={listing.image_url}
                        alt={listing.crop_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                        🌾
                    </div>
                )}
                {listing.is_surplus && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] uppercase tracking-wider bg-farm-warm/90 text-farm-bg rounded font-bold">
                        Surplus
                    </span>
                )}
                {listing.ai_price && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 text-[10px] bg-farm-accent/90 text-farm-bg rounded font-mono"
                    >
                        <Sparkles className="w-3 h-3" />
                        AI Price
                    </motion.span>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-syne font-bold text-farm-text">{listing.crop_name || 'Crop'}</h3>
                        <p className="text-xs text-farm-text-muted font-dm mt-0.5">
                            {listing.quantity} {listing.unit || 'kg'}
                        </p>
                    </div>
                    <p className="font-mono text-xl font-bold text-farm-accent">
                        ₹{listing.price?.toLocaleString() || '0'}
                    </p>
                </div>

                <div className="flex items-center justify-between text-xs text-farm-text-muted">
                    <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{listing.location || 'India'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{listing.seller_name || 'Farmer'}</span>
                    </div>
                </div>

                {listing.ai_price && (
                    <div className="pt-2 border-t border-farm-border/50">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-farm-text-muted">AI Suggested Price</span>
                            <span className="font-mono font-semibold text-farm-accent">₹{listing.ai_price?.toLocaleString()}</span>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
