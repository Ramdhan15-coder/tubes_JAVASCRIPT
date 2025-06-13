const pool = require('../config/database.js');
const Product = require('./Product.js');

const Order = {
  async create(orderData) {
    const { userId, cartItems, totalAmount, shippingDetails, orderNotes } = orderData;
    const connection = await pool.promise().getConnection();

    try {
      await connection.beginTransaction();

      const fullShippingAddress = `${shippingDetails.shippingFullName}\n${shippingDetails.shippingAddress}\nTelp: ${shippingDetails.shippingPhoneNumber}`;

      const orderSql = `
        INSERT INTO orders
        (user_id, order_date, total_amount, status, shipping_address, payment_method_details, notes, created_at, updated_at)
        VALUES (?, NOW(), ?, 'pending_payment', ?, 'Bank Transfer (Menunggu Pembayaran)', ?, NOW(), NOW())
      `;

      const [orderResult] = await connection.query(orderSql, [
        userId,
        totalAmount,
        fullShippingAddress,
        orderNotes
      ]);

      const newOrderId = orderResult.insertId;
      if (!newOrderId) {
        throw new Error('Gagal membuat order, tidak ada order ID yang dihasilkan.');
      }

      for (const item of cartItems) {
        const productForStockCheck = await Product.findById(item.id);
        if (!productForStockCheck || productForStockCheck.stock_quantity < item.quantity) {
            throw new Error(`Stok untuk produk "${item.name}" tidak mencukupi (sisa ${productForStockCheck ? productForStockCheck.stock_quantity : 0}, diminta ${item.quantity}). Pesanan dibatalkan.`);
        }

        const orderItemSql = `
          INSERT INTO order_items
          (order_id, product_id, quantity, price_at_purchase, created_at, updated_at)
          VALUES (?, ?, ?, ?, NOW(), NOW())
        `;
        await connection.query(orderItemSql, [
          newOrderId,
          item.id,
          item.quantity,
          item.price
        ]);

        const newStock = productForStockCheck.stock_quantity - item.quantity;
        await connection.query('UPDATE products SET stock_quantity = ? WHERE product_id = ?', [newStock, item.id]);
      }

      await connection.commit();

      return { orderId: newOrderId, totalAmount: totalAmount };

    } catch (error) {
      await connection.rollback();
      console.error('Error di model Order.create (transaksi di-rollback):', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  },

  async findDetailsForSuccessPage(orderId) {
    try {
      const sql = 'SELECT order_id, total_amount, order_date, status FROM orders WHERE order_id = ?';
      const [rows] = await pool.promise().query(sql, [orderId]);
      return rows[0];
    } catch (error) {
      console.error('Error di model Order.findDetailsForSuccessPage:', error);
      throw error;
    }
  },

  async updatePaymentProof(orderId, paymentProofUrl, newStatus) {
    try {
      const sql = 'UPDATE orders SET payment_proof_url = ?, status = ?, updated_at = NOW() WHERE order_id = ?';
      const [result] = await pool.promise().query(sql, [paymentProofUrl, newStatus, orderId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error di model Order.updatePaymentProof:', error);
      throw error;
    }
  },

  async findByUserId(userId) {
    try {
      const sql = `
        SELECT order_id, order_date, total_amount, status
        FROM orders
        WHERE user_id = ?
        ORDER BY order_date DESC
      `;
      const [orders] = await pool.promise().query(sql, [userId]);
      return orders;
    } catch (error) {
      console.error('Error di model Order.findByUserId:', error);
      throw error;
    }
  },

  async getAllOrdersForAdmin(searchTerm = '') {
    try {
      let sql = `
        SELECT
          o.order_id, o.order_date, o.total_amount, o.status,
          u.username AS customer_username, u.email AS customer_email
        FROM orders o
        JOIN users u ON o.user_id = u.user_id
      `;
      const params = [];

      if (searchTerm) {
        sql += ` WHERE u.username LIKE ? OR u.email LIKE ? OR o.status LIKE ?`;
        const searchTermLike = `%${searchTerm}%`;
        params.push(searchTermLike, searchTermLike, searchTermLike);

        if (!isNaN(searchTerm)) {
          sql += ` OR o.order_id = ?`;
          params.push(parseInt(searchTerm));
        }
      }

      sql += ` ORDER BY o.order_id ASC`;

      const [orders] = await pool.promise().query(sql, params);
      return orders;
    } catch (error) {
      console.error('Error di model Order.getAllOrdersForAdmin:', error);
      throw error;
    }
  },

  async findOrderWithDetailsById(orderId) {
    try {
      const orderSql = `
        SELECT
          o.order_id, o.user_id, o.order_date, o.total_amount, o.status,
          o.shipping_address, o.payment_method_details, o.payment_proof_url, o.notes,
          u.username AS customer_username, u.email AS customer_email
        FROM orders o
        JOIN users u ON o.user_id = u.user_id
        WHERE o.order_id = ?
      `;
      const [orderRows] = await pool.promise().query(orderSql, [orderId]);
      if (orderRows.length === 0) {
        return null;
      }
      const orderDetails = orderRows[0];

      const itemsSql = `
        SELECT
          oi.quantity, oi.price_at_purchase,
          p.name AS product_name, p.image_url AS product_image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        WHERE oi.order_id = ?
      `;
      const [items] = await pool.promise().query(itemsSql, [orderId]);
      orderDetails.items = items;

      return orderDetails;
    } catch (error) {
      console.error('Error di model Order.findOrderWithDetailsById:', error);
      throw error;
    }
  },

  async updateOrderStatus(orderId, newStatus) {
    try {
      const sql = 'UPDATE orders SET status = ?, updated_at = NOW() WHERE order_id = ?';
      const [result] = await pool.promise().query(sql, [newStatus, orderId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error di model Order.updateOrderStatus:', error);
      throw error;
    }
  },

  async deleteOrderById(orderId) {
    const connection = await pool.promise().getConnection();
    try {
      await connection.beginTransaction();

      const deleteItemsSql = 'DELETE FROM order_items WHERE order_id = ?';
      await connection.query(deleteItemsSql, [orderId]);

      const deleteOrderSql = 'DELETE FROM orders WHERE order_id = ?';
      const [result] = await connection.query(deleteOrderSql, [orderId]);

      await connection.commit();

      return result.affectedRows > 0;

    } catch (error) {
      await connection.rollback();
      console.error(`Error saat menghapus order ID ${orderId}:`, error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  },

  async countPendingOrders() {
    try {
      const sql = "SELECT COUNT(order_id) AS total FROM orders WHERE status NOT IN ('selesai', 'dibatalkan')";
      const [rows] = await pool.promise().query(sql);
      return rows[0].total;
    } catch (error) {
      console.error('Error di model Order.countPendingOrders:', error);
      throw error;
    }
  }
};

module.exports = Order;