'use client';
import { useState } from 'react';
import { FileText, Upload, Camera, CheckCircle, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useStore } from '@/lib/store';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

export default function SeniorDocuments() {
  const { state } = useStore();
  const [showUpload, setShowUpload] = useState(false);
  const user = state.currentUser;

  const docs = state.documents.filter(d => d.userId === user?.id);

  const typeIcon: Record<string, string> = {
    prescription: '📋', medication_list: '💊', lab_result: '🔬', other: '📄',
  };

  const typeLabel: Record<string, string> = {
    prescription: 'Prescription', medication_list: 'Medication List',
    lab_result: 'Lab Results', other: 'Document',
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <button onClick={() => setShowUpload(true)} className="btn-primary btn-sm flex gap-2 rounded-xl">
          <Upload size={18} /> Upload
        </button>
      </div>

      <p className="text-gray-500">Store your prescriptions, medication lists, and medical documents here.</p>

      {/* Upload options */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowUpload(true)}
          className="card flex flex-col items-center gap-3 py-5 hover:shadow-card-lg transition-shadow active:scale-[.98]"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center">
            <Camera size={24} className="text-primary-600" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900">Take a Photo</p>
            <p className="text-xs text-gray-500 mt-0.5">Prescription label</p>
          </div>
        </button>
        <button
          onClick={() => setShowUpload(true)}
          className="card flex flex-col items-center gap-3 py-5 hover:shadow-card-lg transition-shadow active:scale-[.98]"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center">
            <FileText size={24} className="text-teal-600" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900">Upload PDF</p>
            <p className="text-xs text-gray-500 mt-0.5">From your files</p>
          </div>
        </button>
      </div>

      {/* Documents list */}
      <h2 className="section-title">Your Documents</h2>
      {docs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FileText size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-gray-600">No documents yet</p>
          <p className="text-sm mt-1">Upload your prescriptions to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map(doc => (
            <div key={doc.id} className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl shrink-0">
                {typeIcon[doc.type] ?? '📄'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{doc.title}</p>
                <p className="text-sm text-gray-500">{typeLabel[doc.type]}</p>
                <p className="text-xs text-gray-400">{format(parseISO(doc.uploadedAt), 'MMMM d, yyyy')}</p>
              </div>
              <div className="shrink-0">
                {doc.isProcessed ? (
                  <span className="flex items-center gap-1 text-success-600 text-xs font-medium">
                    <CheckCircle size={14} /> Processed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-warning-600 text-xs font-medium">
                    <Clock size={14} /> Pending
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload modal */}
      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Add Document" size="md">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center">
            <Upload size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="font-semibold text-gray-700">Drop a file here</p>
            <p className="text-sm text-gray-500 mt-1">PDF, JPG, or PNG up to 10MB</p>
            <button className="btn-primary btn-md mt-4">Choose File</button>
          </div>
          <p className="text-center text-xs text-gray-400">
            Documents are stored securely and never shared without your permission.
          </p>
        </div>
      </Modal>
    </div>
  );
}
