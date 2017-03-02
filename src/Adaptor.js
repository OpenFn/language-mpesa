import { execute as commonExecute, expandReferences } from 'language-common';
import request from 'request';
import { resolve as resolveUrl } from 'url';
import Hashes from 'jshashes';
import js2xmlparser from 'js2xmlparser';

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
    data: null
  }

  return state => {
    return commonExecute(...operations)({ ...initialState, ...state })
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
      mpesaUrl
    } = state.configuration;

    const timeStamp = Date.now();

    // new SHA1 instance and base64 string encoding
    var SHA256 = new Hashes.SHA256().b64(spid + password + timeStamp)
    // output to console
    console.log('SHA256: ' + SHA256)

    const body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:req="http://api-v1.gen.mm.vodafone.com/mminterface/request">
        <soapenv:Header>
            <tns:RequestSOAPHeader xmlns:tns="http://www.huawei.com/schema/osg/common/v2_1">
                <tns:spId>${spid}</tns:spId>
                <tns:spPassword>${SHA256}</tns:spPassword>
                <tns:timeStamp>${timeStamp}</tns:timeStamp>
                <tns:serviceId>${serviceId}</tns:serviceId>
            </tns:RequestSOAPHeader>
        </soapenv:Header>
        <soapenv:Body>
            <req:RequestMsg>
                <![CDATA[<?xml version="1.0" encoding="UTF-8"?>
                <request xmlns="http://api-v1.gen.mm.vodafone.com/mminterface/request">
                <Transaction>
                <CommandID>RegisterURL</CommandID> //Command ID for registering URL
                <OriginatorConversationID>Reg-266-1126</OriginatorConversationID> //always changes on
                every new request
                <Parameters>
                <Parameter>
                <Key>ResponseType</Key> //the default response type
                <Value>Completed</Value> //You can choose between ‘Completed’ and ‘Cancelled’
                </Parameter>
                </Parameters>
                <ReferenceData>
                <ReferenceItem>
                <Key>ValidationURL</Key>
                <Value></Value> //YOUR VALIDATION URL WITH PORT -->
                </ReferenceItem>
                <ReferenceItem>
                <Key>ConfirmationURL</Key>
                <Value>${listenerUrl}</Value> //YOUR CONFIRMATION URL WITH PORT
                </ReferenceItem>
                </ReferenceData>
                </Transaction>
                <Identity>
                <Caller>
                <CallerType>0</CallerType> //Constant variable,remains the same.
                <ThirdPartyID/>
                <Password/>
                <CheckSum/>
                <ResultURL/>
                </Caller>
                <Initiator>
                <IdentifierType>1</IdentifierType> //Constant variable,remains the same
                <Identifier/>
                <SecurityCredential/>
                <ShortCode/>
                </Initiator>
                <PrimaryParty>
                <IdentifierType>1</IdentifierType> //Constant variable, remains the same
                <Identifier/>
                <ShortCode>${shortCode}</ShortCode> //your short code
                </PrimaryParty>
                </Identity>
                <KeyOwner>1</KeyOwner> //Constant variable, remains the same.
                </request>]]>
            </req:RequestMsg>
        </soapenv:Body>
    </soapenv:Envelope>`

    const noBreakBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:req="http://api-v1.gen.mm.vodafone.com/mminterface/request"><soapenv:Header><tns:RequestSOAPHeader xmlns:tns="http://www.huawei.com/schema/osg/common/v2_1"><tns:spId>${spid}</tns:spId><tns:spPassword>${SHA256}</tns:spPassword><tns:timeStamp>${timeStamp}</tns:timeStamp><tns:serviceId>${serviceId}</tns:serviceId></tns:RequestSOAPHeader></soapenv:Header><soapenv:Body><req:RequestMsg><![CDATA[<?xml version="1.0" encoding="UTF-8"?><request xmlns="http://api-v1.gen.mm.vodafone.com/mminterface/request"><Transaction><CommandID>RegisterURL</CommandID><OriginatorConversationID>Reg-266-1126</OriginatorConversationID><Parameters><Parameter><Key>ResponseType</Key><Value>Completed</Value></Parameter></Parameters><ReferenceData><ReferenceItem><Key>ValidationURL</Key><Value></Value></ReferenceItem><ReferenceItem><Key>ConfirmationURL</Key><Value>${listenerUrl}</Value></ReferenceItem></ReferenceData></Transaction><Identity><Caller><CallerType>0</CallerType><ThirdPartyID/><Password/><CheckSum/><ResultURL/></Caller><Initiator><IdentifierType>1</IdentifierType><Identifier/><SecurityCredential/><ShortCode/></Initiator><PrimaryParty><IdentifierType>1</IdentifierType><Identifier/><ShortCode>${shortCode}</ShortCode></PrimaryParty></Identity><KeyOwner>1</KeyOwner></request>]]></req:RequestMsg></soapenv:Body></soapenv:Envelope>`

    function assembleError({ response, error }) {
      if (response && ([200,201,202].indexOf(response.statusCode) > -1)) return false;
      if (error) return error;
      return new Error(`Server responded with ${response.statusCode}`)
    }

    return new Promise((resolve, reject) => {
      console.log("Request body:");
      console.log("\n" + JSON.stringify(noBreakBody, null, 4) + "\n");
      request.post ({
        url: mpesaUrl,
        body: noBreakBody
      }, function(error, response, body){
        error = assembleError({error, response})
        if(error) {
          reject(error);
          console.log(response);
        } else {
          console.log("Printing response...\n");
          console.log(JSON.stringify(response, null, 4) + "\n");
          console.log("POST succeeded.");
          resolve(body);
        }
      })
    }).then((data) => {
      const nextState = { ...state, response: { body: data } };
      return nextState;
    })

  }

};

export {
  field, fields, sourceValue, alterState, each,
  merge, dataPath, dataValue, lastReferenceValue
} from 'language-common';
