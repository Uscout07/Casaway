'use client';
import { Icon } from "@iconify/react";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-ambient pt-[10vh]">
            {/* Hero Section */}
            <div className="bg-forest-medium text-white py-16">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="flex items-center space-x-4 mb-6">
                        <Icon icon="mdi:shield-lock-outline" className="w-8 h-8" />
                        <h1 className="text-4xl font-bold">Privacy Policy</h1>
                    </div>
                    <p className="text-xl text-white/90">
                        Your privacy is important to us. Learn how we protect and use your information.
                    </p>
                    <p className="text-sm text-white/80 mt-4">
                        Effective Date: June 2, 2025
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="prose prose-lg max-w-none">
                    {/* Existing Sections (1–5) here */}

                    {/* Section 6 */}
                    <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-forest-medium mb-4 flex items-center">
                            <span className="bg-forest-medium text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                            Your Rights
                        </h2>
                        <div className="text-gray-700 space-y-4">
                            <ul className="list-disc list-inside ml-4 space-y-2">
                                <li>Access or update your personal data</li>
                                <li>Delete your account and associated data</li>
                                <li>Withdraw consent (if under 18, this can be done by a parent or guardian)</li>
                                <li>Contact us for questions or concerns</li>
                            </ul>
                            <p>To make a request, email us at <strong>support@casaway.com</strong>.</p>
                        </div>
                    </div>

                    {/* Section 7 */}
                    <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-forest-medium mb-4 flex items-center">
                            <span className="bg-forest-medium text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                            Data Retention
                        </h2>
                        <div className="text-gray-700 space-y-4">
                            <p>We retain data only as long as necessary for Service operation or legal obligations. On account deletion, your personal data will be erased unless retention is mandated.</p>
                        </div>
                    </div>

                    {/* Section 8 */}
                    <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-forest-medium mb-4 flex items-center">
                            <span className="bg-forest-medium text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
                            International Users
                        </h2>
                        <div className="text-gray-700 space-y-4">
                            <p>Casaway is based in the United States. If you access the Service from another country, you consent to the transfer and storage of your information in the U.S., where laws may differ.</p>
                        </div>
                    </div>

                    {/* Section 9 */}
                    <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-forest-medium mb-4 flex items-center">
                            <span className="bg-forest-medium text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">4</span>
                            Parental Consent & Minors
                        </h2>
                        <div className="text-gray-700 space-y-4">
                            <p>If you're between 15–17, your parent/guardian must:</p>
                            <ul className="list-disc list-inside ml-4 space-y-2">
                                <li>Review and approve this Privacy Policy</li>
                                <li>Accept responsibility for your usage</li>
                            </ul>
                            <p>We minimize data collection and recommend parents actively monitor minor activity.</p>
                        </div>
                    </div>

                    {/* Section 10 */}
                    <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-forest-medium mb-4 flex items-center">
                            <span className="bg-forest-medium text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">5</span>
                            Policy Updates
                        </h2>
                        <div className="text-gray-700 space-y-4">
                            <p>We may update this policy. Significant changes will be communicated through the app or email. Continued use implies agreement to updated terms.</p>
                        </div>
                    </div>

                    {/* Section 11 */}
                    {/* <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-forest-medium mb-4 flex items-center">
                            <span className="bg-forest-medium text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">6</span>
                            Contact Us
                        </h2>
                        <div className="text-gray-700 space-y-4">
                            <p>For privacy-related concerns or requests:</p>
                            <p><strong>📧 Email:</strong> support@casaway.com</p>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
}
