import React, { useState, useEffect } from 'react';
import { X, Save, User, Building, Phone, Briefcase, Tag } from 'lucide-react';
import { o2dAPI } from "../../services/o2dAPI";
import { useAuth } from "../../context/AuthContext";

interface CustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerToEdit: any;
    onSuccess: () => void;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ isOpen, onClose, customerToEdit, onSuccess }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [marketingUsers, setMarketingUsers] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        "Client Name": '',
        "City": '',
        "Contact Person": '',
        "Contact Details": '',
        "Sales Person": '', // This will hold the user_name
        "sales_person_id": '',
        "Client Type": '',
        "Status": 'Active'
    });

    useEffect(() => {
        if (isOpen) {
            const fetchMarketingUsers = async () => {
                try {
                    const response = await o2dAPI.getMarketingUsers();
                    if (response.data && response.data.success) {
                        setMarketingUsers(response.data.data);
                    }
                } catch (error) {
                    console.error("Error fetching marketing users:", error);
                }
            };
            fetchMarketingUsers();

            const isSales = user?.role === 'Sales';

            if (customerToEdit) {
                setFormData({
                    "Client Name": customerToEdit["Client Name"] || '',
                    "City": customerToEdit["City"] || '',
                    "Contact Person": customerToEdit["Contact Person"] || '',
                    "Contact Details": customerToEdit["Contact Details"] || '',
                    "Sales Person": customerToEdit["Sales Person"] || customerToEdit.sales_person || '',
                    "sales_person_id": customerToEdit.sales_person_id || '',
                    "Client Type": customerToEdit["Client Type"] || '',
                    "Status": customerToEdit["Status"] || 'Active'
                });
            } else {
                setFormData({
                    "Client Name": '',
                    "City": '',
                    "Contact Person": '',
                    "Contact Details": '',
                    "Sales Person": isSales ? (user?.user_name || user?.username || '') : '',
                    "sales_person_id": isSales ? String(user?.id) : '',
                    "Client Type": '',
                    "Status": 'Active'
                });
            }
        }
    }, [isOpen, customerToEdit, user]);

    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSalesPersonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const selectedUser = marketingUsers.find(u => String(u.id) === selectedId);
        setFormData(prev => ({
            ...prev,
            "sales_person_id": selectedId,
            "Sales Person": selectedUser ? selectedUser.user_name : ''
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            client_name: formData["Client Name"],
            city: formData["City"],
            contact_person: formData["Contact Person"],
            contact_details: formData["Contact Details"],
            sales_person_id: formData.sales_person_id ? parseInt(formData.sales_person_id) : null,
            client_type: formData["Client Type"],
            status: formData["Status"]
        };

        try {
            if (customerToEdit) {
                await o2dAPI.updateClient(customerToEdit.id, payload);
            } else {
                await o2dAPI.createClient(payload);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Save error:", error);
            alert('Failed to save customer');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
            <div
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            />

            <div
                className="relative bg-white rounded-t-[2rem] sm:rounded-[2rem] w-full max-w-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-300"
            >
                {/* Header */}
                <div className="px-5 py-4 md:px-8 md:py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/90 backdrop-blur-md sticky top-0 z-20 shrink-0">
                    <div className="min-w-0">
                        <h2 className="text-lg md:text-2xl font-black text-gray-800 tracking-tight truncate">
                            {customerToEdit ? 'Edit Customer' : 'Add New Customer'}
                        </h2>
                        <p className="text-[10px] font-black uppercase text-blue-600/60 tracking-widest mt-0.5">O2D Management</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-white p-2 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 ml-4">
                        <X className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} id="customer-form" className="p-5 md:p-8 space-y-4 md:space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="md:col-span-2">
                            <label className="text-[10px] md:text-xs font-black text-gray-400 mb-1.5 block uppercase tracking-widest">Client Name</label>
                            <div className="relative group">
                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={formData["Client Name"]}
                                    onChange={(e) => handleChange("Client Name", e.target.value)}
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl md:rounded-2xl py-3 md:py-4 pl-11 md:pl-12 pr-4 text-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-sm md:text-lg transition-all focus:bg-white placeholder:text-gray-300"
                                    placeholder="Company Name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] md:text-xs font-black text-gray-400 mb-1.5 block uppercase tracking-widest">City</label>
                            <input
                                type="text"
                                value={formData["City"]}
                                onChange={(e) => handleChange("City", e.target.value)}
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl md:rounded-2xl p-3 md:p-4 text-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold transition-all focus:bg-white text-sm"
                                placeholder="City"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] md:text-xs font-black text-gray-400 mb-1.5 block uppercase tracking-widest">Contact Person</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    value={formData["Contact Person"]}
                                    onChange={(e) => handleChange("Contact Person", e.target.value)}
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl md:rounded-2xl py-3 md:py-4 pl-11 md:pl-12 pr-4 text-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold transition-all focus:bg-white text-sm"
                                    placeholder="Full Name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] md:text-xs font-black text-gray-400 mb-1.5 block uppercase tracking-widest">Contact Details</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={formData["Contact Details"]}
                                    onChange={(e) => handleChange("Contact Details", e.target.value)}
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl md:rounded-2xl py-3 md:py-4 pl-11 md:pl-12 pr-4 text-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold transition-all focus:bg-white text-sm"
                                    placeholder="Phone or Email"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] md:text-xs font-black text-gray-400 mb-1.5 block uppercase tracking-widest">Sales Person</label>
                            <div className="relative group">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5 group-focus-within:text-blue-500 transition-colors" />
                                <select
                                    value={formData.sales_person_id}
                                    onChange={handleSalesPersonChange}
                                    required
                                    disabled={user?.role === 'Sales'}
                                    className={`w-full bg-gray-50/50 border border-gray-200 rounded-xl md:rounded-2xl py-3 md:py-4 pl-11 md:pl-12 pr-10 text-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none font-bold transition-all focus:bg-white cursor-pointer text-sm ${user?.role === 'Sales' ? 'opacity-60 cursor-not-allowed grayscale' : ''}`}
                                >
                                    <option value="">Select Sales Person...</option>
                                    {marketingUsers.map(u => (
                                        <option key={u.id} value={u.id}>{u.user_name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 border-l border-gray-200 pl-3">
                                    <Tag className="w-3 h-3 md:w-4 md:h-4 rotate-90" />
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-[10px] md:text-xs font-black text-gray-400 mb-1.5 block uppercase tracking-widest">Client Type</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['NBD', 'CRR'].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => handleChange("Client Type", type)}
                                        className={`py-3 md:py-4 rounded-xl md:rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2
                                            ${formData["Client Type"] === type
                                                ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-lg shadow-blue-500/10'
                                                : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {customerToEdit && (
                            <div className="md:col-span-2">
                                <label className="text-[10px] md:text-xs font-black text-gray-400 mb-1.5 block uppercase tracking-widest">Status</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Active', 'Inactive', 'Lead'].map((status) => (
                                        <button
                                            key={status}
                                            type="button"
                                            onClick={() => handleChange("Status", status)}
                                            className={`py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2
                                                ${formData["Status"] === status
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                                    : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </form>

                {/* Footer */}
                <div className="p-5 md:p-8 bg-white border-t border-gray-100 shrink-0">
                    <button
                        type="submit"
                        form="customer-form"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 md:py-5 rounded-2xl md:rounded-[1.5rem] shadow-2xl shadow-blue-500/40 hover:-translate-y-1 transition-all flex justify-center items-center space-x-3 text-base md:text-xl active:scale-[0.98] disabled:grayscale disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span className="uppercase tracking-widest text-xs">Processing...</span>
                            </div>
                        ) : (
                            <>
                                <Save className="w-5 h-5 md:w-6 md:h-6" />
                                <span>{customerToEdit ? 'Update Customer' : 'Save Customer'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerModal;
