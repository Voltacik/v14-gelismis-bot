module.exports = {
 name: 'error',
 execute(error) {
  console.log(`Bir hata oluştu: ${error?.message || error || 'Bilinmeyen hata'}`);
 }
}
