import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper, { staggerContainer, staggerItem } from '../components/layout/PageWrapper';
import ListingCard from '../components/marketplace/ListingCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import useStore from '../store/useStore';
import PurchaseModal from '../components/marketplace/PurchaseModal';
import { getListings, getMyListings, createListing, uploadCropImage, deleteListing } from '../services/supabase';
import { getMarketplacePriceSuggestion } from '../services/gemini';
import { CROPS } from '../utils/cropRecommendations';
import { Plus, X, Sparkles, Filter } from 'lucide-react';

export default function Marketplace() {
    const { user, listings, myListings, setListings, setMyListings, addNotification } = useStore();
    const [tab, setTab] = useState('browse');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ crop_name: '', quantity: '', unit: 'kg', price: '', location: '', is_surplus: false });
    const [imageFile, setImageFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [aiPrice, setAiPrice] = useState(null);
    const [filter, setFilter] = useState({ crop_type: '' });
    const [selectedListingForPurchase, setSelectedListingForPurchase] = useState(null);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [allListings, mine] = await Promise.all([
                getListings(filter),
                user ? getMyListings(user.id) : Promise.resolve([]),
            ]);
            setListings(allListings);
            setMyListings(mine);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleGetAIPrice = async () => {
        if (!form.crop_name || !form.quantity) return;
        try {
            const suggestion = await getMarketplacePriceSuggestion(form.crop_name, `${form.quantity} ${form.unit}`, form.location || 'India');
            setAiPrice(suggestion);
            if (suggestion?.suggestedPrice) handleChange('price', suggestion.suggestedPrice.toString());
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        setSubmitting(true);
        try {
            let imageUrl = '';
            if (imageFile) {
                imageUrl = await uploadCropImage(user.id, imageFile);
            }
            await createListing({
                user_id: user.id,
                crop_name: form.crop_name,
                quantity: parseFloat(form.quantity),
                unit: form.unit,
                price: parseFloat(form.price),
                location: form.location,
                image_url: imageUrl,
                is_surplus: form.is_surplus,
                ai_price: aiPrice?.suggestedPrice || null,
                seller_name: user.user_metadata?.full_name || 'Farmer',
                created_at: new Date().toISOString(),
            });
            setShowForm(false);
            setForm({ crop_name: '', quantity: '', unit: 'kg', price: '', location: '', is_surplus: false });
            setAiPrice(null);
            loadData();
        } catch (err) { console.error(err); }
        setSubmitting(false);
    };

    const handleDelete = async (id) => {
        try {
            await deleteListing(id);
            loadData();
        } catch (err) { console.error(err); }
    };

    const handlePurchaseComplete = async (id) => {
        try {
            await deleteListing(id);
            
            if (selectedListingForPurchase) {
                addNotification({
                    type: 'buy',
                    title: 'Purchase Successful',
                    message: `You bought ${selectedListingForPurchase.quantity}${selectedListingForPurchase.unit} of ${selectedListingForPurchase.crop_name}.`
                });
                addNotification({
                    type: 'sell',
                    title: 'Item Sold (Simulated)',
                    message: `Your listing for ${selectedListingForPurchase.quantity}${selectedListingForPurchase.unit} of ${selectedListingForPurchase.crop_name} was bought.`
                });
            }

            setSelectedListingForPurchase(null);
            loadData();
        } catch (err) { console.error(err); }
    };

    const inputClass = "w-full px-4 py-3 bg-fm-bg-base border border-fm-border rounded-lg text-fm-text-primary font-dm text-sm input-animated";
    const labelClass = "text-xs text-fm-text-muted uppercase tracking-wider font-mono mb-1.5 block";

    return (
        <PageWrapper>
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-6xl mx-auto space-y-8">
                <motion.div variants={staggerItem} className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <p className="text-sm text-fm-text-muted font-mono uppercase tracking-widest">Trade</p>
                        <h1 className="font-syne font-extrabold text-4xl md:text-5xl text-fm-text-primary">
                            Market<span className="text-fm-accent">place</span>
                        </h1>
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-fm-accent text-fm-bg-base font-syne font-bold rounded-lg">
                        <Plus className="w-5 h-5" />Create Listing
                    </motion.button>
                </motion.div>

                {/* Tabs */}
                <motion.div variants={staggerItem} className="flex gap-1 bg-fm-bg-elevated rounded-lg p-1">
                    {['browse', 'my'].map((t) => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`flex-1 py-2.5 rounded-md text-sm font-dm font-medium transition-all ${tab === t ? 'bg-fm-accent text-fm-bg-base' : 'text-fm-text-muted hover:text-fm-text-primary'}`}>
                            {t === 'browse' ? 'Browse Listings' : 'My Listings'}
                        </button>
                    ))}
                </motion.div>

                {/* Filter */}
                {tab === 'browse' && (
                    <motion.div variants={staggerItem} className="flex gap-3 items-center">
                        <Filter className="w-4 h-4 text-fm-text-muted" />
                        <select value={filter.crop_type} onChange={(e) => { setFilter({ crop_type: e.target.value }); }}
                            className="px-3 py-2 bg-fm-bg-elevated border border-fm-border rounded-lg text-sm text-fm-text-primary font-dm">
                            <option value="">All Crops</option>
                            {CROPS.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                    </motion.div>
                )}

                {/* Listings */}
                {loading ? <LoadingSpinner text="Loading marketplace..." /> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(tab === 'browse' ? listings : myListings).map((listing, i) => (
                            <div key={listing.id || i} className="relative">
                                <ListingCard 
                                    listing={listing} 
                                    index={i} 
                                    isOwner={user?.id === listing.user_id}
                                    onBuyClick={(item) => setSelectedListingForPurchase(item)} 
                                />
                                {tab === 'my' && (
                                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(listing.id)}
                                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-farm-danger/80 flex items-center justify-center text-white z-10">
                                        <X className="w-4 h-4" />
                                    </motion.button>
                                )}
                            </div>
                        ))}
                        {(tab === 'browse' ? listings : myListings).length === 0 && (
                            <p className="col-span-full text-center text-fm-text-muted py-12 font-dm">No listings found.</p>
                        )}
                    </div>
                )}

                {/* Create Listing Form Modal */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
                            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
                                className="bg-fm-bg-surface border border-fm-border rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-syne font-bold text-xl text-fm-text-primary">New Listing</h2>
                                    <button onClick={() => setShowForm(false)} className="text-fm-text-muted hover:text-fm-text-primary"><X className="w-5 h-5" /></button>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className={labelClass}>Crop Name</label>
                                        <select value={form.crop_name} onChange={(e) => handleChange('crop_name', e.target.value)} required className={inputClass}>
                                            <option value="">Select crop...</option>
                                            {CROPS.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className={labelClass}>Quantity</label><input type="number" value={form.quantity} onChange={(e) => handleChange('quantity', e.target.value)} required className={inputClass} /></div>
                                        <div><label className={labelClass}>Unit</label><select value={form.unit} onChange={(e) => handleChange('unit', e.target.value)} className={inputClass}><option>kg</option><option>quintal</option><option>ton</option></select></div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Location</label>
                                        <input type="text" value={form.location} onChange={(e) => handleChange('location', e.target.value)} className={inputClass} placeholder="e.g., Nashik, Maharashtra" />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className={labelClass}>Price (₹)</label>
                                            <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleGetAIPrice}
                                                className="flex items-center gap-1 text-xs text-fm-accent hover:underline">
                                                <Sparkles className="w-3 h-3" />AI Suggest
                                            </motion.button>
                                        </div>
                                        <input type="number" value={form.price} onChange={(e) => handleChange('price', e.target.value)} required className={inputClass} />
                                        {aiPrice && <p className="text-xs text-fm-accent mt-1 font-mono">AI: ₹{aiPrice.minPrice}–₹{aiPrice.maxPrice} ({aiPrice.reasoning})</p>}
                                    </div>
                                    <div>
                                        <label className={labelClass}>Image</label>
                                        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="text-sm text-fm-text-muted" />
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={form.is_surplus} onChange={(e) => handleChange('is_surplus', e.target.checked)} className="accent-fm-accent" />
                                        <span className="text-sm text-fm-text-secondary">Mark as surplus (connect with NGOs)</span>
                                    </label>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={submitting}
                                        className="w-full py-3 bg-fm-accent text-fm-bg-base font-syne font-bold rounded-lg disabled:opacity-50">
                                        {submitting ? 'Creating...' : 'Create Listing'}
                                    </motion.button>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <AnimatePresence>
                {selectedListingForPurchase && (
                    <PurchaseModal 
                        listing={selectedListingForPurchase}
                        onClose={() => setSelectedListingForPurchase(null)}
                        onComplete={handlePurchaseComplete}
                    />
                )}
            </AnimatePresence>
        </PageWrapper>
    );
}
