describe("dashboard module tests", function () {
  describe("dashboard", function () {
    it("should display the message set in scope", function () {
      var message = element(by.binding('messageText'));
      expect(message.getText()).toBe('Kalabox dashboard module.');
    });
  });
});