import { useState, useEffect } from 'react';
import { Calendar } from '../utils/types';
import { subscribeToCalendars, addCalendar, updateCalendar, deleteCalendar } from '../utils/firebase';
import { useAuth } from '../../AuthContext';

const COLORS = ['#8e44ad','#e67e22','#3498db','#27ae60','#e84393','#c0392b','#2c3e50','#f39c12'];

export const useCalendars = () => {
  const { user } = useAuth();
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [visibleCals, setVisibleCals] = useState<Record<string, boolean>>({});
  const [calModalOpen, setCalModalOpen] = useState(false);
  const [calForm, setCalForm] = useState({ name: '', color: COLORS[0] });
  const [editingCalendar, setEditingCalendar] = useState<Calendar | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToCalendars(user.uid, (cals) => {
        setCalendars(cals);
        setVisibleCals(prev => cals.reduce((acc, c) => ({ ...acc, [c.id]: prev[c.id] ?? c.visible }), {} as Record<string, boolean>));
    });
    return () => unsubscribe();
  }, [user]);

  const openCalModal = (cal: Calendar | null) => {
    setEditingCalendar(cal);
    setCalForm(cal ? { name: cal.name, color: cal.color } : { name: '', color: COLORS[0] });
    setCalModalOpen(true);
  };

  const handleSaveCal = async () => {
    if (!user || !calForm.name.trim()) return;
    setIsLoading(true);
    try {
      const payload = { name: calForm.name.trim(), color: calForm.color };
      if (editingCalendar) {
        await updateCalendar(user.uid, editingCalendar.id, payload);
      } else {
        await addCalendar(user.uid, { ...payload, visible: true });
      }
      setCalModalOpen(false);
    } finally { setIsLoading(false); }
  };

  const handleDeleteCal = async () => {
    if (!user || !editingCalendar || !confirm(`Kalender "${editingCalendar.name}" und alle Termine löschen?`)) return;
    setIsLoading(true);
    try {
      await deleteCalendar(user.uid, editingCalendar.id);
      setCalModalOpen(false);
    } finally { setIsLoading(false); }
  };

  const toggleCalVis = async (id: string) => {
    if (!user) return;
    const next = !visibleCals[id];
    setVisibleCals(p => ({ ...p, [id]: next }));
    try {
      await updateCalendar(user.uid, id, { visible: next });
    } catch {
      setVisibleCals(p => ({ ...p, [id]: !next }));
    }
  };

  return {
    calendars,
    visibleCals,
    calModalOpen,
    calForm,
    editingCalendar,
    isLoading,
    COLORS,
    setCalModalOpen,
    openCalModal,
    handleSaveCal,
    handleDeleteCal,
    toggleCalVis,
    setCalForm,
  };
};