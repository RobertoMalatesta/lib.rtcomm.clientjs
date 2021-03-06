/**
 * This is the implementation of a Chat Protocol.  This sends and receives chat messages
 * The message is in form: {message: message, from: fromid}
 *
 */

/**
   * @memberof module:rtcomm.SubProtocol
   *
   * @description 
   * A Chat is a connection from one peer to another to pass text back and forth
   *
   *  @constructor
   *  @extends  module:rtcomm.SubProtocol
   */

var ChatProtocol = function ChatProtocol() {
  // Call superconstructor
  // Define the Protocol
  //
  function getStartMessage(callback) {
    l('DEBUG') && console.log(this + '.getStartMessage() entry');
    callback && callback(true, this.createMessage.call(this, this.dependencies.parent.userid + ' has initiated a Chat with you'));
  }

  function getStopMessage(callback) {
    callback && callback(true, this.createMessage.call(this, this.dependencies.parent.userid + ' has left the chat'));
  }

  function constructMessage(message) {
    l('DEBUG') && console.log(this + '.constructMessage() MESSAGE: ', message);
    return {
      'message': message,
      'from': this.dependencies.parent.userid
    };
  }

  function handleMessage(message) {
    l('DEBUG') && console.log(this + '.handleMessage() MESSAGE: ', message);
    var parent = this.dependencies.parent;
    // In chat, we emit messages no matter what. 
    this.emit('message', message);
  }

  var protocolDefinition = {
    'name': 'chat',
    'getStartMessage': getStartMessage,
    'getStopMessage': getStopMessage,
    'constructMessage': constructMessage,
    'handleMessage': handleMessage
  }

  SubProtocol.call(this, protocolDefinition);
}
ChatProtocol.prototype = Object.create(SubProtocol.prototype);
ChatProtocol.prototype.constructor = ChatProtocol;
