import React, { useState } from 'react';
import { Department } from '../../types';
import { 
  Building2, Plus, Check, Edit2, ShieldCheck, AlertCircle, 
  Search, Filter, X, Save, Layers, Sparkles, CheckCircle2,
  Trash2, ArrowUpDown
} from 'lucide-react';

interface DepartmentSetupProps {
  departments: Department[];
  onAddDepartment?: (dept: Omit<Department, 'id'>) => void;
  onUpdateDepartment?: (id: string, updates: Partial<Department>) => void;
  onShowToast?: (title: string, desc: string, type?: 'success' | 'error' | 'info') => void;
}

export const DepartmentSetup: React.FC<DepartmentSetupProps> = ({
  departments,
  onAddDepartment,
  onUpdateDepartment,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  // Form state
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'ACADEMIC' | 'ADMINISTRATIVE' | 'STUDENT_SERVICE' | 'FINANCIAL'>('STUDENT_SERVICE');
  const [formDesc, setFormDesc] = useState('');
  const [formOrder, setFormOrder] = useState(1);
  const [formMandatory, setFormMandatory] = useState(true);
  const [formActive, setFormActive] = useState(true);

  const openAddModal = () => {
    setEditingDept(null);
    setFormCode('');
    setFormName('');
    setFormCategory('STUDENT_SERVICE');
    setFormDesc('');
    setFormOrder(departments.length + 1);
    setFormMandatory(true);
    setFormActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setFormCode(dept.code);
    setFormName(dept.name);
    setFormCategory(dept.category);
    setFormDesc(dept.description);
    setFormOrder(dept.order);
    setFormMandatory(dept.isMandatory);
    setFormActive(dept.active);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formName.trim()) return;

    if (editingDept && onUpdateDepartment) {
      onUpdateDepartment(editingDept.id, {
        code: formCode.trim().toUpperCase(),
        name: formName.trim(),
        category: formCategory,
        description: formDesc.trim(),
        order: Number(formOrder),
        isMandatory: formMandatory,
        active: formActive
      });
      if (onShowToast) onShowToast('Department Updated', `Saved configurations for ${formName}.`);
    } else if (onAddDepartment) {
      onAddDepartment({
        code: formCode.trim().toUpperCase(),
        name: formName.trim(),
        category: formCategory,
        description: formDesc.trim(),
        order: Number(formOrder),
        isMandatory: formMandatory,
        active: formActive,
        assignedOfficerIds: [],
        iconName: 'Building2'
      });
      if (onShowToast) onShowToast('Department Created', `Added ${formName} (${formCode}) to clearance units.`);
    }

    setIsModalOpen(false);
  };

  const toggleMandatory = (dept: Department) => {
    if (onUpdateDepartment) {
      onUpdateDepartment(dept.id, { isMandatory: !dept.isMandatory });
      if (onShowToast) {
        onShowToast(
          'Sign-off Threshold Changed',
          `${dept.name} is now ${!dept.isMandatory ? 'Mandatory' : 'Optional'}.`
        );
      }
    }
  };

  const toggleActive = (dept: Department) => {
    if (onUpdateDepartment) {
      onUpdateDepartment(dept.id, { active: !dept.active });
      if (onShowToast) {
        onShowToast(
          'Department Status Changed',
          `${dept.name} is now ${!dept.active ? 'Active' : 'Disabled'}.`
        );
      }
    }
  };

  const filteredDepartments = departments.filter(d => {
    if (selectedCategory !== 'ALL' && d.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchCode = d.code.toLowerCase().includes(q);
      const matchName = d.name.toLowerCase().includes(q);
      const matchDesc = d.description.toLowerCase().includes(q);
      if (!matchCode && !matchName && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-900">
              Clearance Units
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              {departments.length} Units Configured
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Clearance Departments & Sign-Off Hierarchy
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage the 8 statutory clearance offices (Library, Dormitory, Finance, Cafeteria, etc.), sign-off sequence order, and mandatory thresholds.
          </p>
        </div>

        <button
          id="btn-add-department"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search departments by code, name, or description..."
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

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          {['ALL', 'STUDENT_SERVICE', 'FINANCIAL', 'ACADEMIC', 'ADMINISTRATIVE'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDepartments.map((dept) => (
          <div
            key={dept.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500/40 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-blue-900 text-amber-400 font-bold text-sm font-certificate flex items-center justify-center shadow-xs shrink-0">
                    {dept.code}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {dept.name}
                    </h3>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {dept.category.replace('_', ' ')} • Sequence #{dept.order}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(dept)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Edit Department"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => toggleActive(dept)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                      dept.active 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {dept.active ? 'Active' : 'Disabled'}
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                {dept.description}
              </p>
            </div>

            {/* Bottom Details & Toggles */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={() => toggleMandatory(dept)}
                className={`font-semibold text-xs flex items-center gap-1.5 cursor-pointer hover:underline ${
                  dept.isMandatory ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${dept.isMandatory ? 'bg-rose-500' : 'bg-slate-400'}`} />
                {dept.isMandatory ? 'Mandatory for Graduation' : 'Optional Sign-off'}
              </button>

              <span className="text-[11px] text-slate-400">
                {dept.assignedOfficerIds.length > 0 ? `${dept.assignedOfficerIds.length} Officers` : 'Central Roster'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {editingDept ? 'Edit Clearance Department' : 'Register Clearance Department'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Code (e.g. LIB) *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="LIB"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 uppercase font-mono font-bold focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. University Library Services"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="STUDENT_SERVICE">Student Service</option>
                    <option value="FINANCIAL">Financial & Cost Sharing</option>
                    <option value="ACADEMIC">Academic / Department Head</option>
                    <option value="ADMINISTRATIVE">Administrative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Approval Sequence Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department Scope & Clearance Mandate
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe items and property audited by this department..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formMandatory}
                    onChange={(e) => setFormMandatory(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Mandatory Sign-off
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Active in Workflows
                  </span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  {editingDept ? 'Save Changes' : 'Create Department'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
