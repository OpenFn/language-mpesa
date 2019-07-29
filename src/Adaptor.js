import { execute as commonExecute } from 'language-common';
import request from 'request';
import Hashes from 'jshashes';

/** @module Adaptor */

/**
 * Execute a sequence of operations.
 * Wraps `language-common/execute`, and prepends initial state for http.
 * @example
 * execute(
 *   create('foo'),
 *   delete('bar')
 * )(state)
 * @constructor
 * @param {Operations} operations - Operations to be performed.
 * @returns {Operation}
 */
export function execute(...operations) {
  const initialState = {
    references: [],
    data: null,
  };

  return state => {
    return commonExecute(...operations)({ ...initialState, ...state });
  };
}
// #############################################################
// TODO: Move this into the credential setup page on OpenFn/core
// #############################################################
export function registerListener() {
  return state => {
    const {
      spid,
      password,
      serviceId,
      shortCode,
      listenerUrl,
      mpesaUrl,
    } = state.configuration;

    function pad(number) {
      if (number < 10) {
        return '0' + number;
      }
      return number;
    }

    const date = new Date();
    // Ugly way of getting the YYYYMMDDHHmmSS stamp...
    const timeStamp = date
      .toISOString()
      .replace(/[.,\/#!TZ$%\^&\*;:{}=\-_`~()]/g, '')
      .slice(0, 14);

    console.log('SPID: ' + spid);
    console.log('Password: ' + password);
    console.log('TimeStamp: ' + timeStamp);
    const authString = spid + password + timeStamp;
    console.log('Pre-encryption auth string: ' + authString);

    // new SHA256 instance and base64 string encoding
    var SHA256 = new Hashes.SHA256();
    const crypted = SHA256.hex(authString);
    // output to console
    console.log('SHA256 crypted auth: ' + crypted);

    const base64crypted = new Buffer(crypted).toString('base64');
    console.log('base64 of the crypted auth: ' + base64crypted);

    // const send = false;
    const send = true;

    const body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:req="http://api-v1.gen.mm.vodafone.com/mminterface/request">
        <soapenv:Header>
            <tns:RequestSOAPHeader xmlns:tns="http://www.huawei.com/schema/osg/common/v2_1">
                <tns:spId>${spid}</tns:spId>
                <tns:spPassword>${base64crypted}</tns:spPassword>
                <tns:timeStamp>${timeStamp}</tns:timeStamp>
                <tns:serviceId>${serviceId}</tns:serviceId>
            </tns:RequestSOAPHeader>
        </soapenv:Header>
        <soapenv:Body>
            <req:RequestMsg>
                <![CDATA[<?xml version="1.0" encoding="UTF-8"?>
                <request xmlns="http://api-v1.gen.mm.vodafone.com/mminterface/request">
                <Transaction>
                <CommandID>RegisterURL</CommandID>
                <OriginatorConversationID>Reg-266-1126</OriginatorConversationID>
                every new request
                <Parameters>
                <Parameter>
                <Key>ResponseType</Key>
                <Value>Completed</Value>
                </Parameter>
                </Parameters>
                <ReferenceData>
                <ReferenceItem>
                <Key>ValidationURL</Key>
                <Value>http://10.66.49.201:8099/mock%3C/Value%3E</Value>
                </ReferenceItem>
                <ReferenceItem>
                <Key>ConfirmationURL</Key>
                <Value>${listenerUrl}</Value>
                </ReferenceItem>
                </ReferenceData>
                </Transaction>
                <Identity>
                <Caller>
                <CallerType>0</CallerType>
                <ThirdPartyID/>
                <Password/>
                <CheckSum/>
                <ResultURL/>
                </Caller>
                <Initiator>
                <IdentifierType>1</IdentifierType>
                <Identifier/>
                <SecurityCredential/>
                <ShortCode/>
                </Initiator>
                <PrimaryParty>
                <IdentifierType>1</IdentifierType>
                <Identifier/>
                <ShortCode>${shortCode}</ShortCode>
                </PrimaryParty>
                </Identity>
                <KeyOwner>1</KeyOwner>
                </request>]]>
            </req:RequestMsg>
        </soapenv:Body>
    </soapenv:Envelope>`;

    function assembleError({ response, error }) {
      if (response && [200, 201, 202].indexOf(response.statusCode) > -1)
        return false;
      if (error) return error;
      return new Error(`Server responded with ${response.statusCode}`);
    }

    if (send) {
      return new Promise((resolve, reject) => {
        console.log('Request body:');
        console.log('\n' + JSON.stringify(body, null, 4) + '\n');
        request.post(
          {
            url: mpesaUrl,
            body: body,
          },
          function(error, response, body) {
            error = assembleError({ error, response });
            if (error) {
              reject(error);
              console.log(response);
            } else {
              console.log('Printing response...\n');
              console.log(JSON.stringify(response, null, 4) + '\n');
              console.log('POST succeeded.');
              resolve(body);
            }
          }
        );
      }).then(data => {
        const nextState = { ...state, response: { body: data } };
        return nextState;
      });
    }
  };
}

export {
  field,
  fields,
  sourceValue,
  alterState,
  each,
  merge,
  dataPath,
  dataValue,
  lastReferenceValue,
} from 'language-common';
