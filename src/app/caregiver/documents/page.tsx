'use client';
import { useState } from 'react';
import { FileText, Upload, CheckCircle, Clock, Eye } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useStore } from '@/lib/store';
import { Modal } from '@/components/ui/Modal';

export default function CaregiverDocuments() {
  const { state } = useStore();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>('all');

  const user = state.currentUser;
  const memberIds = state.familyMembers
    .filter(fm => fm.caregiverId === user?.id)
    .map(fm => fm.userId);
  const memberList = state.familyMembers.filter(fm => fm.caregiverId === user?.id);

  const getMemberName = (uid: string) =>
    state.familyMembers.find(fm => fm.userId === uid)?.user.name ?? '';

  const docs = state.documents.filter(d =>
    memberIds.includes(d.userId) &&
    (selectedMember === 'all' || d.userId === selectedMember)
  );

  const typeIcon: Record<string, string> = {
    prescription: '📋', medication_list: '💊', lab_result: '🔬', other: '📄',
  };
  const typeLabel: Record<string, string> = {
    prescription: 'Prescription', medication_list: 'Medication List',
    lab_result: 'Lab Results', other: 'Document',
  };

  if (!user) return null;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 text-sm">{docs.length} document{docs.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <select
            className="input w-auto text-sm"
            value={selectedMember}
            onChange={e => setSelectedMember(e.target.value)}
          >
            <option value="all">All Members</option>
            {memberList.map(fm => (
              <option key={fm.userId} value={fm.userId}>{fm.user.name}</option>
            ))}
          </select>
          <button onClick={() => setShowUpload(true)} className="btn-primary btn-md flex gap-2">
            <Upload size={18} /> Upload
          </button>
        </div>
      </div>

      {docs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-gray-600">No documents uploaded</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0 divide-y divide-border">
          {docs.map(doc => (
            <div key={doc.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl shrink-0">
                {typeIcon[doc.type] ?? '📄'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{doc.title}</p>
                <p className="text-sm text-gray-500">
                  {getMemberName(doc.userId)} · {typeLabel[doc.type]}
                </p>
                <p className="text-xs text-gray-400">{format(parseISO(doc.uploadedAt), 'MMMM d, yyyy')}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {doc.isProcessed ? (
                  <span className="flex items-center gap-1 text-success-600 text-xs font-medium">
                    <CheckCircle size={14} /> Processed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-warning-600 text-xs font-medium">
                    <Clock size={14} /> Processing
                  </span>
                )}
                <button className="btn-ghost p-2 rounded-lg" aria-label="View">
                  <Eye size={16} className="text-gray-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload Document" size="md">
        <div className="space-y-4">
          <div>
            <label className="label">Patient</label>
            <select className="input">
              {memberList.map(fm => (
                <option key={fm.userId} value={fm.userId}>{fm.user.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Document type</label>
            <select className="input">
              <option value="prescription">Prescription</option>
              <option value="medication_list">Medication List</option>
              <option value="lab_result">Lab Results</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center">
            <Upload size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="font-semibold text-gray-700">Drop file or click to browse</p>
            <p className="text-sm text-gray-500 mt-1">PDF, JPG, PNG up to 10MB</p>
            <button className="btn-primary btn-md mt-4">Choose File</button>
          </div>
          <button className="w-full btn-teal btn-lg" onClick={() => setShowUpload(false)}>
            Upload Document
          </button>
        </div>
      </Modal>
    </div>
  );
}
