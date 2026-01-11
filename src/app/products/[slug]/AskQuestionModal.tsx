'use client';

import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface AskQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
}

export default function AskQuestionModal({ isOpen, onClose, productId, productName }: AskQuestionModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');
        setErrorMessage('');

        try {
            const res = await fetch('/api/messages/product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    productId,
                    productName
                }),
            });

            if (!res.ok) {
                throw new Error('Bir hata oluştu, lütfen tekrar deneyin.');
            }

            setStatus('success');
            setFormData({ name: '', email: '', phone: '', message: '' });
            setTimeout(() => {
                onClose();
                setStatus('idle');
            }, 2000);
        } catch (err: any) {
            setStatus('error');
            setErrorMessage(err.message || 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                                <div className="flex justify-between items-center mb-4">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-bold leading-6 text-gray-900"
                                    >
                                        Soru Sor: <span className="text-brand-primary-600">{productName}</span>
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                                    >
                                        <XMarkIcon className="w-6 h-6 text-gray-500" />
                                    </button>
                                </div>

                                {status === 'success' ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                            <PaperAirplaneIcon className="w-8 h-8 text-green-600" />
                                        </div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">Gönderildi!</h4>
                                        <p className="text-gray-600">Sorunuz başarıyla iletildi. En kısa sürede size dönüş yapacağız.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                                Adınız Soyadınız
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary-500 focus:ring-brand-primary-500 sm:text-sm p-3 border"
                                                placeholder="Adınız Soyadınız"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                E-posta Adresiniz
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary-500 focus:ring-brand-primary-500 sm:text-sm p-3 border"
                                                placeholder="ornek@email.com"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                                Telefon (Opsiyonel)
                                            </label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary-500 focus:ring-brand-primary-500 sm:text-sm p-3 border"
                                                placeholder="05XX XXX XX XX"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                                Sorunuz
                                            </label>
                                            <textarea
                                                id="message"
                                                required
                                                rows={4}
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary-500 focus:ring-brand-primary-500 sm:text-sm p-3 border"
                                                placeholder="Ürün hakkında merak ettiklerinizi buraya yazabilirsiniz..."
                                            />
                                        </div>

                                        {status === 'error' && (
                                            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                                                {errorMessage}
                                            </div>
                                        )}

                                        <div className="mt-6">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="inline-flex w-full justify-center rounded-xl border border-transparent bg-brand-primary-900 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-800 focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                            >
                                                {loading ? 'Gönderiliyor...' : 'Soruyu Gönder'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
