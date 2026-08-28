import React, { useState } from 'react';
import { ClearanceRequirement, Department, ClearanceReasonType } from '../../types';
import { 
  Sliders, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, 
  FileText, ShieldCheck, CheckSquare, Search, Filter, Sparkles,
  Layers, ChevronRight, X, ArrowUpDown, HelpCircle
} from 'lucide-react';

interface ClearanceRulesEngineProps {
  requirements: ClearanceRequirement[];
  departments: Department[];
  onAddRequirement?: (req: Omit<ClearanceRequirement, 'id'>) => void;
  onUpdateRequirement?: (id: string, updates: Partial<ClearanceRequirement>) => void;
}

export const ClearanceRulesEngine: React.FC<ClearanceRulesEngineProps> = ({
  requirements,
  departments,
  onAddRequirement,
  onUpdateRequirement
}) => {
  const [selectedDeptId, setSelectedDeptId] = useState<string>('ALL');
  const [selectedReason, setSelectedReason] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState<ClearanceRequirement | null>(null);

  // Form state
  const [formDeptId, setFormDeptId] = useState(departments[0]?.id || '');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIsMandatory, setFormIsMandatory] = useState(true);
  const [formRequiresDoc, setFormRequiresDoc] = useState(false);
  const [formDocName, setFormDocName] = useState('');
  const [formChecklist, setFormChecklist] = useState<string[]>(['']);
  const [formActive, setFormActive] = useState(true);

  const openAddModal = () => {
    setEditingReq(null);
    setFormDeptId(departments[0]?.id || '');
    setFormTitle('');
    setFormDesc('');
    setFormIsMandatory(true);
    setFormRequiresDoc(false);
    setFormDocName('');
    setFormChecklist(['Return all assigned items', 'Pay any outstanding service fines']);
    setFormActive(true);
    setIsAddModalOpen(true);
  };

  const openEditModal = (req: ClearanceRequirement) => {
    setEditingReq(req);
    setFormDeptId(req.departmentId);
    setFormTitle(req.title);
    setFormDesc(req.description);
    setFormIsMandatory(req.isMandatory);
    setFormRequiresDoc(req.requiresDocumentUpload);
    setFormDocName(req.requiredDocumentName || '');
    setFormChecklist(req.checklistItems && req.checklistItems.length > 0 ? [...req.checklistItems] : ['']);
    setFormActive(req.active);
    setIsAddModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDeptId) return;

    const cleanedChecklist = formChecklist.map(c => c.trim()).filter(Boolean);

    if (editingReq && onUpdateRequirement) {
      onUpdateRequirement(editingReq.id, {
        departmentId: formDeptId,
        title: formTitle.trim(),
        description: formDesc.trim(),
        isMandatory: formIsMandatory,
        requiresDocumentUpload: formRequiresDoc,
        requiredDocumentName: formRequiresDoc ? formDocName.trim() : undefined,
        checklistItems: cleanedChecklist,
        active: formActive
      });
    } else if (onAddRequirement) {
      onAddRequirement({
        departmentId: formDeptId,
        title: formTitle.trim(),
        description: formDesc.trim(),
        isMandatory: formIsMandatory,
        requiresDocumentUpload: formRequiresDoc,
        requiredDocumentName: formRequiresDoc ? formDocName.trim() : undefined,
        applicablePrograms: ['ALL'],
        applicableColleges: ['ALL'],
        applicableReasons: ['ALL' as any],
        active: formActive,
        checklistItems: cleanedChecklist.length > 0 ? cleanedChecklist : ['Standard department clearance criteria']
      });
    }

    setIsAddModalOpen(false);
  };

  const filteredRequirements = requirements.filter(req => {
    if (selectedDeptId !== 'ALL' && req.departmentId !== selectedDeptId) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = req.title.toLowerCase().includes(q);
      const matchDesc = req.description.toLowerCase().includes(q);
      const dept = departments.find(d => d.id === req.departmentId);
      const matchDept = dept?.name.toLowerCase().includes(q) || dept?.code.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchDept) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-900">
              Rules & Policy Engine
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              {requirements.length} Active Rules
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Department Clearance Criteria & Checklist Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure automated validation rules, mandatory document upload mandates, and clearance checklist items for Hawassa University offices.
          </p>
        </div>

        <button
          id="btn-add-clearance-rule"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Clearance Rule
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-rules"
            type="text"
            placeholder="Search rules, criteria, or document mandates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          <button
            onClick={() => setSelectedDeptId('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
              selectedDeptId === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Departments ({requirements.length})
          </button>
          {departments.map(dept => {
            const deptReqCount = requirements.filter(r => r.departmentId === dept.id).length;
            return (
              <button
                key={dept.id}
                onClick={() => setSelectedDeptId(dept.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                  selectedDeptId === dept.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {dept.code} ({deptReqCount})
              </button>
            );
          })}
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRequirements.map(req => {
          const dept = departments.find(d => d.id === req.departmentId);
          return (
            <div
              key={req.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-blue-900 text-amber-400 font-bold text-xs flex items-center justify-center font-certificate shadow-xs shrink-0">
                      {dept?.code || 'GEN'}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {req.title}
                      </h3>
                      <p className="text-[11px] text-slate-400">{dept?.name || 'Central Office'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(req)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Rule"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      req.active
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {req.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                  {req.description}
                </p>

                {/* Badges / Mandatory flags */}
                <div className="flex flex-wrap items-center gap-2 mt-3.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                    req.isMandatory 
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900' 
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {req.isMandatory ? '★ Mandatory Requirement' : '☆ Optional'}
                  </span>

                  {req.requiresDocumentUpload && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Attachment: {req.requiredDocumentName || 'Document Slip'}
                    </span>
                  )}
                </div>

                {/* Checklist items list */}
                {req.checklistItems && req.checklistItems.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Verification Checklist ({req.checklistItems.length} steps)
                    </span>
                    <ul className="space-y-1">
                      {req.checklistItems.map((item, idx) => (
                        <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Bottom Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Target: All Colleges & Programs
                </span>
                <button
                  onClick={() => {
                    if (onUpdateRequirement) {
                      onUpdateRequirement(req.id, { active: !req.active });
                    }
                  }}
                  className={`text-[11px] font-bold cursor-pointer hover:underline ${
                    req.active ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {req.active ? 'Deactivate Rule' : 'Activate Rule'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRequirements.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <Sliders className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">No clearance rules match your filter</h3>
          <p className="text-xs text-slate-400">Try selecting another department or clearing search query.</p>
        </div>
      )}

      {/* Add/Edit Rule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {editingReq ? 'Edit Clearance Rule' : 'Create New Clearance Rule'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Responsible Department *
                </label>
                <select
                  value={formDeptId}
                  onChange={(e) => setFormDeptId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code}) - {dept.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Rule Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Return Library Borrowed Items & Clear Fines"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Instructions for Student
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain what the student must settle before this department approves..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Checkboxes: Mandatory & Document Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsMandatory}
                    onChange={(e) => setFormIsMandatory(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Mandatory Sign-off
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formRequiresDoc}
                    onChange={(e) => setFormRequiresDoc(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Requires Document Attachment
                  </span>
                </label>
              </div>

              {formRequiresDoc && (
                <div className="animate-in fade-in duration-150">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Required Document Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cost Sharing Agreement Slip / Bank Deposit Slip"
                    value={formDocName}
                    onChange={(e) => setFormDocName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={formRequiresDoc}
                  />
                </div>
              )}

              {/* Checklist items dynamic editor */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Officer Verification Checklist Items
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormChecklist([...formChecklist, ''])}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {formChecklist.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Checklist item #${idx + 1}`}
                        value={item}
                        onChange={(e) => {
                          const updated = [...formChecklist];
                          updated[idx] = e.target.value;
                          setFormChecklist(updated);
                        }}
                        className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
                      />
                      {formChecklist.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setFormChecklist(formChecklist.filter((_, i) => i !== idx))}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  {editingReq ? 'Save Changes' : 'Create Rule'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
