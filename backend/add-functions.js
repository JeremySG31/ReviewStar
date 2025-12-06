const fs = require('fs');

const newFunctions = `
// Eliminar comentario propio
export const deleteComment = async (req, res) => {
  const { reviewId, commentId } = req.params;
  try {
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });
    const comment = review.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comentario no encontrado' });
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    comment.remove();
    await review.save();
    res.json({ message: 'Comentario eliminado', success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error eliminando comentario' });
  }
};

// Editar comentario propio
export const editComment = async (req, res) => {
  const { reviewId, commentId } = req.params;
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ message: 'Comentario vacío' });
  try {
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });
    const comment = review.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comentario no encontrado' });
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    comment.text = text.trim();
    comment.edited = true;
    comment.editedAt = new Date();
    await review.save();
    res.json({ message: 'Comentario editado', comment, success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error editando comentario' });
  }
};

// Reaccionar a comentario
export const reactToComment = async (req, res) => {
  const { reviewId, commentId } = req.params;
  const { reaction } = req.body;
  const valid = ['👍', '❤️', '😂'];
  if (!valid.includes(reaction)) return res.status(400).json({ message: 'Reacción inválida' });
  try {
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });
    const comment = review.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comentario no encontrado' });
    if (!comment.reactions) comment.reactions = { '👍': [], '❤️': [], '😂': [] };
    const userId = req.user._id.toString();
    const arr = comment.reactions[reaction] || [];
    const has = arr.some(id => id.toString() === userId);
    if (has) {
      comment.reactions[reaction] = arr.filter(id => id.toString() !== userId);
    } else {
      for (const k of valid) {
        comment.reactions[k] = (comment.reactions[k] || []).filter(id => id.toString() !== userId);
      }
      comment.reactions[reaction].push(req.user._id);
    }
    await review.save();
    res.json({ message: has ? 'Reacción eliminada' : 'Reacción agregada', reactions: comment.reactions, success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error en reacción' });
  }
};
`;

const content = fs.readFileSync('../controllers/reviewController.js', 'utf8');
if (!content.includes('export const deleteComment')) {
    fs.appendFileSync('../controllers/reviewController.js', newFunctions);
    console.log('✅ Funciones agregadas correctamente');
} else {
    console.log('⚠️ Las funciones ya existen');
}
