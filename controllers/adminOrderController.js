const Order = require('../models/Order.js');

const adminOrderController = {
  listAllOrders: async (req, res) => {
    try {
      const searchTerm = req.query.search || '';

      const orders = await Order.getAllOrdersForAdmin(searchTerm);

      const adminUsername = req.session.user ? req.session.user.username : 'Admin';

      res.render('admin/orders/list_orders', {
        title: 'Kelola Semua Pesanan',
        orders: orders,
        username: adminUsername,
        searchTerm: searchTerm
      });
    } catch (error) {
      console.error("Error saat mengambil semua daftar pesanan:", error);
      req.session.errorMessage = 'Gagal mengambil data pesanan.';
      res.redirect('/admin/dashboard');
    }
  },

  showOrderDetail: async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const order = await Order.findOrderWithDetailsById(orderId);
      const adminUsername = req.session.user ? req.session.user.username : 'Admin';

      if (!order) {
        req.session.errorMessage = `Pesanan dengan ID ${orderId} tidak ditemukan.`;
        return res.redirect('/admin/orders');
      }

      const possibleOrderStatuses = [
        'pending_payment',
        'menunggu_konfirmasi',
        'pembayaran_diterima',
        'diproses',
        'dikirim',
        'selesai',
        'dibatalkan'
      ];

      res.render('admin/orders/detail_order', {
        title: `Detail Pesanan #${order.order_id}`,
        order: order,
        username: adminUsername,
        statuses: possibleOrderStatuses,
      });
    } catch (error) {
      console.error(`Error saat menampilkan detail pesanan #${req.params.orderId}:`, error);
      req.session.errorMessage = 'Gagal menampilkan detail pesanan.';
      res.redirect('/admin/orders');
    }
  },

  handleUpdateOrderStatus: async (req, res) => {
    const orderId = req.params.orderId;
    const { newStatus } = req.body;

    try {
      if (!newStatus) {
        req.session.errorMessage = 'Status baru tidak boleh kosong.';
        return res.redirect(`/admin/orders/view/${orderId}`);
      }

      const success = await Order.updateOrderStatus(orderId, newStatus);

      if (success) {
        req.session.successMessage = `Status pesanan #${orderId} berhasil diupdate menjadi "${newStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}"!`;
      } else {
        req.session.errorMessage = `Gagal mengupdate status pesanan #${orderId}. Pesanan mungkin tidak ditemukan.`;
      }
    } catch (error) {
      console.error(`Error saat update status pesanan #${orderId}:`, error);
      req.session.errorMessage = `Terjadi kesalahan: ${error.message || 'Gagal mengupdate status pesanan.'}`;
    }
    res.redirect(`/admin/orders/view/${orderId}`);
  },

  handleCancelOrder: async (req, res) => {
    const orderId = req.params.orderId;
    try {
      const success = await Order.updateOrderStatus(orderId, 'dibatalkan');
      if (success) {
        req.session.successMessage = `Pesanan #${orderId} berhasil dibatalkan.`;
      } else {
        req.session.errorMessage = `Gagal membatalkan pesanan #${orderId}.`;
      }
    } catch (error) {
      console.error(`Error saat membatalkan pesanan #${orderId}:`, error);
      req.session.errorMessage = `Terjadi kesalahan saat membatalkan pesanan.`;
    }
    res.redirect(`/admin/orders/view/${orderId}`);
  },

  handleDeleteOrder: async (req, res) => {
    const orderId = req.params.orderId;
    try {
      const success = await Order.deleteOrderById(orderId);
      if (success) {
        req.session.successMessage = `Pesanan #${orderId} berhasil dihapus permanen.`;
      } else {
        req.session.errorMessage = `Gagal menghapus pesanan #${orderId}, pesanan mungkin tidak ditemukan.`;
      }
    } catch (error) {
      console.error("Error saat menghapus pesanan:", error);
      req.session.errorMessage = 'Terjadi kesalahan saat menghapus pesanan.';
    }
    res.redirect('/admin/orders');
  }
};

module.exports = adminOrderController;