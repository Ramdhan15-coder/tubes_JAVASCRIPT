const Review = require('../models/Review.js');

const reviewController = {
  handleAddReview: async (req, res) => {
    try {
      const productId = req.params.productId;

      const { rating, comment } = req.body;

      if (!req.session.user || !req.session.user.userId) {
        req.session.errorMessage = 'Anda harus login untuk memberikan ulasan.';
        return res.redirect(`/produk/${productId}`);
      }
      const userId = req.session.user.userId;

      if (!rating || !comment || comment.trim() === '') {
        req.session.errorMessage = 'Rating dan komentar tidak boleh kosong.';
        return res.redirect(`/produk/${productId}`);
      }
      if (rating < 1 || rating > 5) {
        req.session.errorMessage = 'Rating harus antara 1 sampai 5.';
        return res.redirect(`/produk/${productId}`);
      }

      const reviewData = {
        product_id: parseInt(productId),
        user_id: userId,
        rating: parseInt(rating),
        comment: comment
      };

      await Review.create(reviewData);

      req.session.successMessage = 'Ulasan Anda berhasil ditambahkan!';
      res.redirect(`/produk/${productId}`);

    } catch (error) {
      console.error("Error saat menambahkan review:", error);
      req.session.errorMessage = 'Gagal menambahkan ulasan. Terjadi kesalahan.';
      const productIdForRedirect = req.params.productId || '';
      if (productIdForRedirect) {
        res.redirect(`/produk/${productIdForRedirect}`);
      } else {
        res.redirect('/dashboard_user');
      }
    }
  }
};

module.exports = reviewController;