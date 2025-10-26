/* scripts/helpers.js
   Responsibility: lightweight utilities for date math, storage, id generation and validation.
   Exposes window.AppHelpers namespace.
*/
(function(){
  window.AppHelpers = window.AppHelpers || {};

  const STORAGE_KEY = 'brightday.birthdays.v1';

  // Generate a short unique id
  window.AppHelpers.generateId = function(){
    return 'id_' + Math.random().toString(36).slice(2,9);
  };

  // Save to localStorage
  window.AppHelpers.save = function(items){
    try{
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items || []));
      return true;
    }catch(e){
      console.error('Save failed', e);
      return false;
    }
  };

  // Load from localStorage
  window.AppHelpers.load = function(){
    try{
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    }catch(e){
      console.error('Load failed', e);
      return [];
    }
  };

  // Validate entry shape
  window.AppHelpers.validate = function(entry){
    if (!entry) return false;
    if (!entry.id || !entry.name || !entry.date) return false;
    // date should be parseable
    const d = new Date(entry.date);
    if (isNaN(d.getTime())) return false;
    return true;
  };

  // Format date as Month day (e.g., Jun 21)
  window.AppHelpers.formatShort = function(isoDate){
    try{
      const d = new Date(isoDate);
      const opts = { month: 'short', day: 'numeric' };
      return d.toLocaleDateString(undefined, opts);
    }catch(e){ return isoDate; }
  };

  // Compute days until next birthday (0 means today)
  window.AppHelpers.daysUntil = function(isoDate){
    try{
      const now = new Date();
      const d = new Date(isoDate);
      // Use month and day only, compute next occurrence
      const year = now.getFullYear();
      const candidate = new Date(year, d.getMonth(), d.getDate());
      // reset times for fairness
      candidate.setHours(0,0,0,0);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (candidate.getTime() < today.getTime()){
        candidate.setFullYear(year + 1);
      }
      const diff = Math.ceil((candidate - today) / (1000 * 60 * 60 * 24));
      return diff;
    }catch(e){ console.error(e); return 0; }
  };

  // Return true if within n days
  window.AppHelpers.withinDays = function(isoDate, n){
    return window.AppHelpers.daysUntil(isoDate) <= n;
  };

  // Simple seeded color for avatar backgrounds
  const colors = ['#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#10b981','#06b6d4','#3b82f6','#6366f1','#8b5cf6','#ec4899'];
  window.AppHelpers.avatarColor = function(name){
    const s = (name || '').toLowerCase().split('').reduce((acc,c)=>acc + c.charCodeAt(0), 0);
    return colors[s % colors.length];
  };

}());
