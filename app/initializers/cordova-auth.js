import Session from '../services/session';

export default {
  name: 'session',

  initialize: function(container, application) {
    container.register('session:main', Session);

    application.inject('route', 'session', 'session:main');
    application.inject('controller', 'session', 'session:main');
    application.inject('view', 'session', 'session:main');
  }
};
