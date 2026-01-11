'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface OrderModalProps {
    isOpen: boolean;
    closeModal: () => void;
    product: {
        _id: string;
        name: string;
        slug: string;
    };
}

export default function OrderModal({ isOpen, closeModal, product }: OrderModalProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        note: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product._id,
                    ...formData,
                }),
            });

            if (response.ok) {
                setSuccess(true);
            } else {
                alert('Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyiniz.');
            }
        } catch (error) {
            console.error('Order error:', error);
            alert('Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSuccess(false);
        setFormData({ customerName: '', customerEmail: '', customerPhone: '', customerAddress: '', note: '' });
        closeModal();
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                {success ? (
                                    <div className="text-center py-8">
                                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                                            <CheckCircleIcon className="h-10 w-10 text-green-600" />
                                        </div>
                                        <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 mb-2">
                                            Siparişiniz Alındı!
                                        </Dialog.Title>
                                        <p className="text-sm text-gray-500 mb-6">
                                            Sipariş detaylarınız e-posta adresinize gönderilmiştir. En kısa sürede sizinle iletişime geçeceğiz.
                                        </p>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-xl border border-transparent bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-all"
                                            onClick={handleClose}
                                        >
                                            Tamam
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900">
                                                    Şimdi Sipariş Verin
                                                </Dialog.Title>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {product.name}
                                                </p>
                                            </div>
                                            <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                                                <XMarkIcon className="w-5 h-5 text-gray-500" />
                                            </button>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    value={formData.customerName}
                                                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                                                    <input
                                                        type="email"
                                                        required
                                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        value={formData.customerEmail}
                                                        onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                                                    <input
                                                        type="tel"
                                                        required
                                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        value={formData.customerPhone}
                                                        onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Teslimat Adresi</label>
                                                <textarea
                                                    required
                                                    rows={3}
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                                    value={formData.customerAddress}
                                                    onChange={e => setFormData({ ...formData, customerAddress: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Sipariş Notu (İsteğe bağlı)</label>
                                                <textarea
                                                    rows={2}
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                                    value={formData.note}
                                                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                                                />
                                            </div>

                                            <div className="pt-2">
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="w-full inline-flex justify-center rounded-xl border border-transparent bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                                >
                                                    {loading ? 'Gönderiliyor...' : 'Siparişi Onayla'}
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
