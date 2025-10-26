/* scripts/ui.js
   Responsibility: define window.App with init and render methods, UI event wiring, and application state.
   Uses jQuery for DOM manipulation and AppHelpers for utilities.
*/
(function($){
  window.App = window.App || {};

  // Application state
  App.state = {
    items: [],
    filter: 'all',
    search: '',
    sort: 'soonest'
  };

  // Render helpers
  App.renderList = function(){
    const $list = $('#list');
    $list.empty();
    const items = App.state.items.slice();

    // compute daysUntil for sorting and labels
    items.forEach(i => i._days = window.AppHelpers.daysUntil(i.date));

    if (App.state.sort === 'name'){
      items.sort((a,b)=> a.name.localeCompare(b.name));
    } else {
      items.sort((a,b)=> a._days - b._days);
    }

    // Apply search/filter
    const filtered = items.filter(it => {
      if (App.state.filter === 'today' && it._days !== 0) return false;
      if (App.state.filter === 'this-week' && it._days > 7) return false;
      if (App.state.search){
        const s = App.state.search.toLowerCase();
        if (!(it.name.toLowerCase().includes(s) || (it.note || '').toLowerCase().includes(s))) return false;
      }
      return true;
    });

    if (filtered.length === 0){
      $list.append('<div class="text-slate-500 p-6 rounded-md bg-slate-50">No birthdays found. Use Quick Add to add someone.</div>');
      $('#totalCount').text(App.state.items.length);
      $('#weekCount').text(App.state.items.filter(i=>i._days<=7).length);
      $('#todayCount').text(App.state.items.filter(i=>i._days===0).length);
      $('#monthList').empty();
      return;
    }

    filtered.forEach(it => {
      const initials = (it.name || '').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase();
      const color = window.AppHelpers.avatarColor(it.name || 'x');
      const days = it._days;
      const dayLabel = days === 0 ? 'Today' : (days === 1 ? 'Tomorrow' : days + ' days');
      const soonClass = days <= 3 ? 'soontoday' : '';

      const $card = $(
        `<div class="birthday-item ${soonClass} rounded-lg p-4 flex items-center gap-4" data-id="${it.id}" tabindex="0">
           <div class=\"avatar\" style=\"background:${color}\">${initials}</div>
           <div class=\"flex-1 min-w-0\">
             <div class=\"flex items-center gap-2\">
               <div class=\"font-medium truncate\">${window.xssEscape ? window.xssEscape(it.name) : escapeHtml(it.name)}</div>
               <div class=\"ml-2 text-xs text-slate-500\">${window.AppHelpers.formatShort(it.date)}</div>
               <div class=\"ml-auto text-sm font-semibold text-indigo-600\">${dayLabel}</div>
             </div>
             <div class=\"text-sm text-slate-500 truncate mt-1\">${it.note ? escapeHtml(it.note) : ''}</div>
           </div>
           <div class=\"flex items-center gap-2\">
             <button class=\"editBtn btn-secondary text-sm\" aria-label=\"Edit ${escapeHtml(it.name)}\">Edit</button>
             <button class=\"delBtn text-sm text-rose-600\">Delete</button>
           </div>
         </div>`
      );

      $card.find('.editBtn').on('click', function(){ App.openEdit(it.id); });
      $card.find('.delBtn').on('click', function(){ App.deleteItem(it.id); });
      $card.on('keydown', function(e){ if (e.key === 'Enter') App.openEdit(it.id); });

      $list.append($card);
    });

    $('#totalCount').text(App.state.items.length);
    $('#weekCount').text(App.state.items.filter(i=>i._days<=7).length);
    $('#todayCount').text(App.state.items.filter(i=>i._days===0).length);

    // Update month list
    const now = new Date();
    const thisMonth = now.getMonth();
    const monthItems = App.state.items.filter(i => (new Date(i.date)).getMonth() === thisMonth).slice(0,6);
    const $month = $('#monthList'); $month.empty();
    monthItems.forEach(mi => {
      $month.append(`<div class=\"flex items-center gap-3\"><div class=\"w-8 text-sm font-medium\">${window.AppHelpers.formatShort(mi.date)}</div><div class=\"text-sm truncate\">${escapeHtml(mi.name)}</div></div>`);
    });
  };

  // Utility: safe escape for text content
  function escapeHtml(str){
    if (!str) return '';
    return String(str).replace(/[&<>"'`]/g, function(s){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;', '`':'&#96;'}[s];
    });
  }

  // Add item
  App.addItem = function(entry){
    try{
      if (!entry.id) entry.id = window.AppHelpers.generateId();
      if (!window.AppHelpers.validate(entry)) throw new Error('Invalid entry');
      // ensure date saved as ISO yyyy-mm-dd
      entry.date = (new Date(entry.date)).toISOString().slice(0,10);
      App.state.items.push(entry);
      window.AppHelpers.save(App.state.items);
      App.render();
      return true;
    }catch(e){ console.error(e); return false; }
  };

  App.updateItem = function(id, data){
    const idx = App.state.items.findIndex(i=>i.id===id);
    if (idx === -1) return false;
    App.state.items[idx] = Object.assign({}, App.state.items[idx], data);
    window.AppHelpers.save(App.state.items);
    App.render();
    return true;
  };

  App.deleteItem = function(id){
    if (!confirm('Delete this birthday?')) return;
    App.state.items = App.state.items.filter(i=>i.id!==id);
    window.AppHelpers.save(App.state.items);
    App.render();
  };

  App.openEdit = function(id){
    const it = App.state.items.find(x=>x.id===id);
    if (!it) return;
    $('#eId').val(it.id);
    $('#eName').val(it.name);
    $('#eDate').val((new Date(it.date)).toISOString().slice(0,10));
    $('#eNote').val(it.note || '');
    $('#modal').addClass('show').show();
    $('#eName').focus();
  };

  App.closeEdit = function(){
    $('#modal').removeClass('show').hide();
  };

  // Initialize event handlers and load data
  App.init = function(){
    try{
      App.state.items = window.AppHelpers.load();

      // Wire UI
      $('#search').on('input', function(){ App.state.search = $(this).val().trim(); App.render(); });
      $('#filter').on('change', function(){ App.state.filter = $(this).val(); App.render(); });
      $('#sort').on('change', function(){ App.state.sort = $(this).val(); App.render(); });

      $('#btnNew').on('click', function(){ $('#qName').focus(); $('html,body').animate({scrollTop: $('#quickForm').offset().top - 80},200); });

      $('#quickForm').on('submit', function(e){ e.preventDefault();
        const name = $('#qName').val().trim(); const date = $('#qDate').val(); const note = $('#qNote').val().trim();
        if (!name || !date){ alert('Please provide a name and valid date'); return; }
        App.addItem({ name, date, note });
        $('#quickForm')[0].reset();
        $('#qName').focus();
      });

      $('#btnImport').on('click', function(){
        const sample = [
          { id: window.AppHelpers.generateId(), name: 'Alice Morgan', date: nextDateISO(3), note: 'Brunch at 11' },
          { id: window.AppHelpers.generateId(), name: 'Ben Carter', date: nextDateISO(10), note: 'Surprise' },
          { id: window.AppHelpers.generateId(), name: 'Jia Chen', date: nextDateISO(0), note: 'Send card' }
        ];
        App.state.items = App.state.items.concat(sample);
        window.AppHelpers.save(App.state.items);
        App.render();
      });

      // Modal handlers
      $('#btnCancelEdit').on('click', function(){ App.closeEdit(); });
      $('#editForm').on('submit', function(e){ e.preventDefault();
        const id = $('#eId').val(); const name = $('#eName').val().trim(); const date = $('#eDate').val(); const note = $('#eNote').val().trim();
        if (!name || !date) { alert('Name and date required'); return; }
        App.updateItem(id, { name, date, note });
        App.closeEdit();
      });

      // Close modal by clicking backdrop
      $('#modal').on('click', function(e){ if (e.target === this) App.closeEdit(); });

      // Keyboard accessibility: Esc to close modal
      $(document).on('keydown', function(e){ if (e.key === 'Escape') App.closeEdit(); });

      // initial render
      App.render();
    }catch(e){ console.error('App.init error', e); }
  };

  // Render entrypoint
  App.render = function(){
    try{
      // Recompute days for all items
      App.state.items.forEach(i=> i._days = window.AppHelpers.daysUntil(i.date));

      // Keep items saved (in case external edits) and then render
      window.AppHelpers.save(App.state.items);
      App.renderList();
    }catch(e){ console.error('App.render error', e); }
  };

  // Helper: produce an ISO date n days from today (preserves month/day semantics)
  function nextDateISO(days){
    const d = new Date(); d.setDate(d.getDate() + days);
    return d.toISOString().slice(0,10);
  }

  // Expose small helpers for testing / debugging if needed
  App._helpers = { nextDateISO };

}(jQuery));
