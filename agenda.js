const MAX_RETARDO = 2147483647;

class Invitado {
  constructor(nombre, email) {
    this.nombre = nombre;
    this.email = email;
  }
}

class Alerta {
  constructor(fechaHora, mensajeAlerta) {
    this.fechaHora = fechaHora;
    this.mensajeAlerta = mensajeAlerta;
    this.timerID = null;
    this.activa = true;
  }
}

class Evento {
  constructor(nombre, fechaHora, lugar) {
    this.nombre = nombre;
    this.fechaHora = fechaHora;
    this.lugar = lugar;
    this.invitados = [];
    this.alertas = [];
  }

  agregarInvitado(nombre, email) {
    this.invitados.push(new Invitado(nombre, email));
  }

  eliminarInvitado(email) {
    for (let i = 0; i < this.invitados.length; i++) {
      if (this.invitados[i].email === email) {
        this.invitados.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  agregarAlerta(fechaHora, mensajeAlerta) {
    const alerta = new Alerta(fechaHora, mensajeAlerta);
    this.alertas.push(alerta);
    this.programarAlerta(alerta);
    return alerta;
  }

  programarAlerta(alerta) {
    const retardo = alerta.fechaHora.getTime() - Date.now();

    if (retardo < 0) {
      console.warn("La alerta ya pasó: " + alerta.mensajeAlerta);
      alerta.activa = false;
      return;
    }

    if (retardo > MAX_RETARDO) {
      console.warn("Alerta demasiado lejos (más de 24,8 días), no se programa: " + alerta.mensajeAlerta);
      return;
    }

    alerta.timerID = setTimeout(function () {
      console.log("ALERTA: " + alerta.mensajeAlerta);
      alerta.activa = false;
    }, retardo);
  }

  cancelarAlerta(alerta) {
    if (alerta.timerID !== null) {
      clearTimeout(alerta.timerID);
      alerta.activa = false;
    }
  }
}

const agenda = {
  eventos: [],

  buscar: function (nombre) {
    for (let i = 0; i < this.eventos.length; i++) {
      if (this.eventos[i].nombre === nombre) {
        return this.eventos[i];
      }
    }
    return null;
  },

  agregarEvento: function (nombre, fecha, lugar) {
    if (!(fecha instanceof Date) || isNaN(fecha.getTime())) {
      return "La fecha no es válida.";
    }
    if (this.buscar(nombre) !== null) {
      return "Ya existe un evento con ese nombre.";
    }
    if (fecha < new Date()) {
      return "La fecha del evento ya ha pasado.";
    }
    this.eventos.push(new Evento(nombre, fecha, lugar));
    return "";
  },

  eliminarEvento: function (nombre) {
    const evento = this.buscar(nombre);
    if (evento === null) {
      return "No existe ese evento.";
    }

    for (let i = 0; i < evento.alertas.length; i++) {
      evento.cancelarAlerta(evento.alertas[i]);
    }

    for (let j = 0; j < this.eventos.length; j++) {
      if (this.eventos[j] === evento) {
        this.eventos.splice(j, 1);
        break;
      }
    }
    return "";
  },

  nuevoInvitado: function (nombreEvento, nombre, email) {
    const evento = this.buscar(nombreEvento);
    if (evento === null) {
      return "No existe ese evento.";
    }
    if (email.indexOf("@") === -1) {
      return "El email no es válido.";
    }
    evento.agregarInvitado(nombre, email);
    return "";
  },

  eliminarInvitado: function (nombreEvento, email) {
    const evento = this.buscar(nombreEvento);
    if (evento === null) {
      return "No existe ese evento.";
    }
    if (!evento.eliminarInvitado(email)) {
      return "No existe un invitado con ese email.";
    }
    return "";
  }
};