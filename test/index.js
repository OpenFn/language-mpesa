import { expect } from 'chai';

import nock from 'nock';
import ClientFixtures, { fixtures } from './ClientFixtures';

import Adaptor from '../src';
const { execute, event, dataElement, get } = Adaptor;

const testState = {
  configuration: {
    hostUrl: 'https://sandbox.safaricom.co.ke',
    consumerKey: 'shhh',
    consumerSecret: 'doubleShh',
    shortCode: '601402',
    username: 'testapi402',
    password: 'Safaricom111!',
    listenerUrl: 'https://www.openfn.org/inbox/abc123xyz',
  },
  data: {},
};

describe('execute', () => {
  before(() => {
    nock(testState.configuration.hostUrl, {
      headers: {
        host: 'sandbox.safaricom.co.ke',
        authorization: 'Basic c2hoaDpkb3VibGVTaGg=',
      },
    })
      .persist()
      .get('/oauth/v1/generate?grant_type=client_credentials')
      .reply(200, {
        access_token: 'fakeToken',
        expires_in: '3599',
      });
  });

  it('authenticates and executes each operation in sequence', done => {
    let state = testState;
    let operations = [
      state => {
        return { counter: 1 };
      },
      state => {
        return { counter: 2 };
      },
      state => {
        return { counter: 3 };
      },
    ];

    execute(...operations)(state)
      .then(finalState => {
        expect(finalState).to.eql({ counter: 3 });
      })
      .then(done)
      .catch(done);
  });

  it('assigns references, data to the initialState', () => {
    let state = testState;

    let finalState = execute()(state);

    execute()(state).then(finalState => {
      expect(finalState).to.eql({
        references: [],
        data: {},
        configuration: {
          hostUrl: 'https://sandbox.safaricom.co.ke',
          consumerKey: 'shhh',
          consumerSecret: 'doubleShh',
          shortCode: '601402',
          username: 'testapi402',
          password: 'Safaricom111!',
          listenerUrl: 'https://www.openfn.org/inbox/abc123xyz',
          oAuth: {
            access_token: 'fakeToken',
            expires_in: '3599',
          },
        },
      });
    });
  });
});
