/* Formulaire : la validation est faite par main.js ; ici on ouvre WhatsApp avec le message prêt à envoyer */
document.getElementById('cform').addEventListener('submit', function (e) {
  if (e.defaultPrevented) return;
  e.preventDefault();
  var f = e.target.elements;
  var txt = 'Bonjour, je suis ' + f.nom.value.trim() + ' (tél : ' + f.tel.value.trim() + (f.email.value.trim() ? ', e-mail : ' + f.email.value.trim() : '') + ').\n' + f.message.value.trim();
  window.location.href = 'https://wa.me/22674501181?text=' + encodeURIComponent(txt);
});
