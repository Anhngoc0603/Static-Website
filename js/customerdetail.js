async function safeJson(url, def){ try{ const r = await fetch(url); if(!r.ok) throw new Error('http '+r.status); return r.json(); }catch{ return def; } }
    function getParam(name){ const u = new URL(window.location.href); return u.searchParams.get(name); }
    function formatCurrency(n){ return `$${Number(n||0).toFixed(2)}`; }

    async function render(){
      const customerId = getParam('id');
      const customerName = getParam('name');
      // Ưu tiên dữ liệu trong admin/orders.json; fallback sang cart/orderData.json
      const ordersRaw = await safeJson('/admin/orders.json', null) || await safeJson('/cart/orderData.json', []);
      const orders = Array.isArray(ordersRaw) ? ordersRaw : Object.values(ordersRaw || {});
      const filtered = orders.filter(o => (customerId && String(o.customerId)===String(customerId)) || (customerName && String(o.customer)===String(customerName)));
      const name = filtered[0]?.customer || customerName || customerId || 'Unknown Customer';
      document.getElementById('title').textContent = `Lịch sử đơn hàng — ${name}`;

      // Summary
      const totalOrders = filtered.length;
      const totalRevenue = filtered.reduce((s,o)=> s + (Number(o.total)||0), 0);
      const statusCounts = filtered.reduce((m,o)=>{ m[o.status] = (m[o.status]||0)+1; return m; }, {});
      document.getElementById('sumOrders').textContent = totalOrders;
      document.getElementById('sumRevenue').textContent = formatCurrency(totalRevenue);
      document.getElementById('sumStatuses').textContent = Object.entries(statusCounts).map(([k,v])=>`${k}: ${v}`).join(' • ') || '-';

      const tbody = document.getElementById('ordersBody');
      tbody.innerHTML = filtered.map(o => `
        <tr>
          <td>${o.id}</td>
          <td>${o.status}</td>
          <td>${o.eta || '-'}</td>
          <td>${formatCurrency(o.total)}</td>
          <td class="item-list">${Array.isArray(o.items)? o.items.map(i=>`${i.name} x${i.qty||i.quantity||1}`).join(', ') : ''}</td>
        </tr>
      `).join('');
    }
    document.addEventListener('DOMContentLoaded', ()=>{
      document.getElementById('backBtn').addEventListener('click', ()=>{ window.location.href = "/admin.html#customers"; });
      render();
    });