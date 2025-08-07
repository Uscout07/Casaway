import { Icon } from "@iconify/react"

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-ambient pt-[10vh]">
            {/* Hero Section */}
            <div className="bg-forest-medium text-white py-16">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="flex items-center space-x-4 mb-6">
                        <Icon icon="mdi:file-document-outline" className="w-8 h-8" />
                        <h1 className="text-4xl font-bold">Terms & Conditions</h1>
                    </div>
                    <p className="text-xl text-white/90">
                        Please read these terms carefully before using Casaway
                    </p>
                    <p className="text-sm text-white/80 mt-4">
                        Effective Date: June 2, 2025
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="prose prose-lg max-w-none">
                    <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                        <p className="text-gray-700 leading-relaxed mb-6">
                            Welcome to Casaway! These Terms & Conditions ("Terms") govern your use of the Casaway app and services ("Service"). By accessing or using Casaway, you agree to follow these Terms. If you do not agree, do not use the Service.
                        </p>
                    </div>

                    {/* Section 1 */}
                    <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-forest-medium mb-4 flex items-center">
                            <span className="bg-forest-medium text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                            Eligibility
                        </h2>
                        <div className="text-gray-700 space-y-4">
                            <p>Casaway is available to individuals <strong>aged 15 and older</strong>. By using the Service, you confirm that:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>You are at least 15 years old.</li>
                                <li>If you are under 18, you have <strong>parental or legal guardian consent</strong> to use the Service.</li>
                                <li>All information you provide is accurate and truthful.</li>
                            </ul>
                            <p>Casaway reserves the right to request age verification or proof of guardian consent at any time.</p>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-forest-medium mb-4 flex items-center">
                            <span className="bg-forest-medium text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                            Users Under 18
                        </h2>
                        <div className="text-gray-700 space-y-4">
                            <p>If you are aged <strong>15 to 17, you may use Casaway only with the informed consent and supervision of a parent or legal guardian</strong>, who:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Has read and agreed to these Terms on your behalf, and</li>
                                <li>Accepts full responsibility for your use of the Service, including any stays, communication, or arrangements.</li>
                            </ul>
                            <p>Casaway does not verify parental consent and assumes no liability for underage use without permission.</p>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-forest-medium mb-4 flex items-center">
                            <span className="bg-forest-medium text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
                            Casaway Is a Neutral Platform
                        </h2>
                        <div className="text-gray-700 space-y-4">
                            <p>Casaway is a platform that enables users to connect and coordinate temporary housing swaps or stays. Casaway:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Does not own, control, inspect, verify, or guarantee</strong> any property, user, or arrangement made through the app.</li>
                                <li><strong>Is not a party</strong> to any agreement, swap, or travel arrangement between users.</li>
                                <li><strong>Does not perform background checks</strong> or screen users.</li>
                            </ul>
                            <p>All arrangements are made <strong>at your own risk</strong>, and you are solely responsible for your actions and decisions.</p>
                        </div>
                    </div>

                    {/* Section 4 */}
                    <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-forest-medium mb-4 flex items-center">
                            <span className="bg-forest-medium text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">4</span>
                            User Responsibilities
                        </h2>
                        <div className="text-gray-700 space-y-4">
                            <p>By using Casaway, you agree:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>To interact with others respectfully and truthfully.</li>
                                <li>Not to engage in scams, fraud, harassment, or any unlawful activity.</li>
                                <li>To care for any property you visit and communicate clearly with any hosts or guests.</li>
                                <li>To follow local laws and behave safely during any travel or stay arranged through the platform.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 5 */}
                    <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-forest-medium mb-4 flex items-center">
                            <span className="bg-forest-medium text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">5</span>
                            Release of Liability
                        </h2>
                        <div className="text-gray-700 space-y-4">
                            <p>You agree to <strong>release and hold harmless Casaway, its founder(s), employees, contractors, and affiliates</strong> from any claims, damages, injuries, or disputes resulting from:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Property damage, theft, or loss;</li>
                                <li>Personal injury, illness, or accidents;</li>
                                <li>Fraudulent users or deceptive behavior;</li>
                                <li>Miscommunications, failed arrangements, or cancellations;</li>
                                <li>Any other user interaction on or off the platform.</li>
                            </ul>
                            <p>Casaway is <strong>not liable</strong> for what occurs between users, nor for the condition, legality, or safety of any location or listing.</p>
                        </div>
                    </div>

                    {/* Remaining sections */}
                    <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-forest-medium mb-4 flex items-center">
                            <span className="bg-forest-medium text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">6</span>
                            Account Suspension or Termination
                        </h2>
                        <div className="text-gray-700 space-y-4">
                            <p>Casaway may suspend or permanently remove your access to the app at any time if:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>You violate these Terms,</li>
                                <li>You are involved in scams or user complaints,</li>
                                <li>You submit false information, or</li>
                                <li>You misuse or attempt to damage the platform in any way.</li>
                            </ul>
                            <p>Casaway reserves the right to take such action at its sole discretion, with or without notice.</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-forest-medium mb-4 flex items-center">
                            <span className="bg-forest-medium text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">7</span>
                            Reporting Misuse
                        </h2>
                        <div className="text-gray-700 space-y-4">
                            <p>If you encounter inappropriate behavior, scams, or unsafe situations, please report it to us at <strong>support@casaway.com</strong>. Casaway may investigate and remove users based on reports, but we are not obligated to intervene in user disputes.</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-forest-medium mb-4 flex items-center">
                            <span className="bg-forest-medium text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">8</span>
                            Modifications
                        </h2>
                        <div className="text-gray-700 space-y-4">
                            <p>We may update or change these Terms at any time. You will be notified of material changes via the app or email. Continued use of the Service after updates constitutes your acceptance of the new Terms.</p>
                            <p>We also reserve the right to change, suspend, or discontinue any part of the platform at any time.</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                        <h2 className="text-2xl font-bold text-forest-medium mb-4 flex items-center">
                            <span className="bg-forest-medium text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">9</span>
                            Intellectual Property
                        </h2>
                        <div className="text-gray-700 space-y-4">
                            <p>All content on Casaway — including the name, logo, app design, and features — is owned by Casaway and protected under copyright and trademark laws. You may not copy, use, or reproduce any part of the app without written permission.</p>
                        </div>
                    </div>

                    {/* Contact Section
                    <div className="bg-forest-medium text-white rounded-xl p-8 text-center">
                        <Icon icon="mdi:email-outline" className="w-12 h-12 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Questions about our Terms?</h3>
                        <p className="mb-4">We're here to help clarify anything you need to know.</p>
                        <a 
                            href="mailto:support@casaway.com" 
                            className="inline-flex items-center space-x-2 bg-white text-forest-medium px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors duration-200"
                        >
                            <Icon icon="mdi:email" className="w-4 h-4" />
                            <span>Contact Support</span>
                        </a>
                    </div> */}
                </div>
            </div>
        </div>
    );
}