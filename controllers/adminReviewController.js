const Review = require('../models/Review.js');

const adminReviewController = {
  listAllReviews: async (req, res) => {
    try {
      const searchTerm = req.query.search || '';

      const reviews = await Review.getAllReviewsForAdmin(searchTerm);

      const adminUsername = req.session.user ? req.session.user.username : 'Admin';

      res.render('admin/reviews/list_reviews', {
        title: 'Kelola Semua Ulasan',
        reviews: reviews,
        username: adminUsername,
        searchTerm: searchTerm
      });
    } catch (error) {
      console.error("Error saat mengambil semua daftar ulasan:", error);
      req.session.errorMessage = 'Gagal mengambil data ulasan.';
      res.redirect('/admin/dashboard');
    }
  },

  renderEditReviewForm: async (req, res) => {
    try {
      const reviewId = req.params.id;
      const reviewToEdit = await Review.findReviewById(reviewId);
      const adminUsername = req.session.user ? req.session.user.username : 'Admin';

      if (!reviewToEdit) {
        req.session.errorMessage = `Review dengan ID ${reviewId} tidak ditemukan.`;
        return res.redirect('/admin/reviews');
      }

      res.render('admin/reviews/edit_review_form', {
        title: `Edit Review untuk Produk: ${reviewToEdit.product_name}`,
        review: reviewToEdit,
        username: adminUsername,
        formError: null
      });
    } catch (error) {
      console.error("Error saat menampilkan form edit review:", error);
      req.session.errorMessage = 'Gagal menampilkan form edit review.';
      res.redirect('/admin/reviews');
    }
  },

  handleUpdateReview: async (req, res) => {
    const reviewId = req.params.id;
    const { rating, comment } = req.body;
    const adminUsername = req.session.user ? req.session.user.username : 'Admin';

    try {
      if (!rating || !comment || comment.trim() === '') {
        const reviewToEdit = await Review.findReviewById(reviewId);
        return res.status(400).render('admin/reviews/edit_review_form', {
          title: `Edit Review untuk Produk: ${reviewToEdit.product_name}`,
          review: reviewToEdit,
          username: adminUsername,
          formError: 'Rating dan Komentar tidak boleh kosong!',
        });
      }
      if (rating < 1 || rating > 5) {
        const reviewToEdit = await Review.findReviewById(reviewId);
          return res.status(400).render('admin/reviews/edit_review_form', {
          title: `Edit Review untuk Produk: ${reviewToEdit.product_name}`,
          review: reviewToEdit,
          username: adminUsername,
          formError: 'Rating harus antara 1 sampai 5.',
        });
      }

      const reviewData = { rating: parseInt(rating), comment };
      const success = await Review.updateReviewById(reviewId, reviewData);

      if (success) {
        req.session.successMessage = `Review ID ${reviewId} berhasil diupdate!`;
      } else {
        req.session.errorMessage = `Gagal mengupdate review ID ${reviewId}. Tidak ada data yang berubah atau review tidak ditemukan.`;
      }
      res.redirect('/admin/reviews');

    } catch (error) {
      console.error("Error saat mengupdate review:", error);
      const reviewToEdit = await Review.findReviewById(reviewId);
      res.status(500).render('admin/reviews/edit_review_form', {
        title: `Edit Review untuk Produk: ${reviewToEdit ? reviewToEdit.product_name : 'Error'}`,
        review: reviewToEdit,
        username: adminUsername,
        formError: 'Terjadi kesalahan saat mengupdate data review.',
      });
    }
  },
  handleDeleteReview: async (req, res) => {
    const reviewId = req.params.id;

    try {
      const success = await Review.deleteReviewById(reviewId);

      if (success) {
        req.session.successMessage = `Review dengan ID ${reviewId} berhasil dihapus!`;
      } else {
        req.session.errorMessage = `Review dengan ID ${reviewId} tidak ditemukan atau gagal dihapus.`;
      }
    } catch (error) {
      console.error("Error saat menghapus review:", error);
      req.session.errorMessage = `Terjadi kesalahan saat menghapus review ID ${reviewId}.`;
    }
    res.redirect('/admin/reviews');
  }
};

module.exports = adminReviewController;