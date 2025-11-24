$(function() {
  // Cache de selectores
  var $form = $('#send-form');
  var $contact = $('#contact-search');
  var $amount = $('#amount');
  var $balance = $('#balance');
  var $btn = $('#send-btn');
  var $msg = $('#msg');
  var $history = $('#history');

  // Parse saldo inicial desde atributo data-init
  var currentBalance = parseFloat($balance.data('init')) || 0;

  // Formato helper
  function formatCurrency(v) {
    return '$' + v.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
  }

  // Actualiza visual del balance con animación numérica simple
  function animateBalanceTo(newValue) {
    var start = currentBalance;
    var end = newValue;
    var steps = 20;
    var step = 0;
    var delta = (end - start) / steps;
    var t = setInterval(function() {
      step++;
      var val = start + delta * step;
      $balance.text(formatCurrency(Math.max(val,0)));
      if (step >= steps) {
        clearInterval(t);
        currentBalance = end;
        $balance.text(formatCurrency(currentBalance));
      }
    }, 25);
  }

  // Inicializar balance visual
  $balance.text(formatCurrency(currentBalance));

  // Autocomplete usando lista global ALW_CONTACTS
  $contact.autocomplete({
    source: window.ALW_CONTACTS || [],
    minLength: 1,
    delay: 100,
    select: function(event, ui) {
      // Colocar valor seleccionado
      $contact.val(ui.item.value);
      // quitar posible estilo de error
      $contact.removeClass('error');
      return false;
    }
  });

  // Validación simple
  function validate() {
    var errors = [];
    var contactVal = $.trim($contact.val());
    var amountVal = $.trim($amount.val()).replace(',', '.');
    var amount = parseFloat(amountVal);

    if (!contactVal) errors.push({field:$contact, msg:'Seleccione un contacto.'});
    else if (window.ALW_CONTACTS.indexOf(contactVal) === -1) {
      errors.push({field:$contact, msg:'Contacto no encontrado. Seleccione de la lista.'});
    }

    if (!amountVal || isNaN(amount) || amount <= 0) {
      errors.push({field:$amount, msg:'Ingrese una cantidad válida mayor que 0.'});
    } else if (amount > currentBalance) {
      errors.push({field:$amount, msg:'Saldo insuficiente.'});
    }

    return {ok: errors.length === 0, errors: errors, amount: amount, contact: contactVal};
  }

  // Mostrar mensaje con efecto
  function showMessage(type, text) {
    $msg.removeClass('success error').addClass(type).stop(true,true).hide().text(text).fadeIn(250).delay(2000).slideUp(300);
  }

  // Efecto para campo con error
  function highlightError($field) {
    $field.addClass('error').animate({opacity:0.85},80).animate({opacity:1},80);
    setTimeout(function(){ $field.removeClass('error'); }, 1500);
  }

  // Habilitar/deshabilitar botón según validaciones en tiempo real
  function toggleButton() {
    var v = validate();
    $btn.prop('disabled', !v.ok);
  }

  $contact.on('input', toggleButton);
  $amount.on('input', function() {
    // permitir solo números, punto y comas; transformar comas a punto
    var cleaned = $(this).val().replace(/[^0-9\.,]/g,'').replace(',', '.');
    $(this).val(cleaned);
    toggleButton();
  });

  // Manejo optimizado del submit
  $form.on('submit', function(e) {
    e.preventDefault();
    var v = validate();
    if (!v.ok) {
      // Mostrar primer error y animar campo
      var first = v.errors[0];
      highlightError(first.field);
      showMessage('error', first.msg);
      return;
    }

    // Simular envío: bloquear UI y mostrar carga
    $btn.prop('disabled', true).text('Enviando...');
    $contact.prop('disabled', true);
    $amount.prop('disabled', true);

    // Simular respuesta del servidor
    setTimeout(function() {
      // actualizar saldo localmente
      var newBalance = Math.max(0, (currentBalance - v.amount));
      animateBalanceTo(newBalance);

      // Añadir registro al historial con efecto
      var $li = $('<li>').text('Enviado ' + formatCurrency(v.amount) + ' a ' + v.contact);
      $history.prepend($li);
      $li.slideDown(300);

      // Mostrar mensaje de éxito
      showMessage('success', 'Transferencia completada.');

      // Reset formulario y reactivar
      $form[0].reset();
      $contact.prop('disabled', false);
      $amount.prop('disabled', false);
      $btn.prop('disabled', false).text('Enviar');

      // Mantener la nueva balance
      currentBalance = newBalance;

    }, 800); // latencia simulada
  });

  // Inicial: deshabilitar botón hasta datos válidos
  toggleButton();
});