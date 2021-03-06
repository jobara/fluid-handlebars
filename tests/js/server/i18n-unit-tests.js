/*

    Test the i18n helper functions in isolation.

*/
/* eslint-env node */
"use strict";
var fluid = require("infusion");
var jqUnit = require("node-jqunit");

fluid.require("%fluid-handlebars");

jqUnit.module("Unit tests for i18n functions.");

jqUnit.test("Testing message loading.", function () {
    var messageBundle = fluid.handlebars.i18n.loadMessageBundles(
        {
            primary: "%fluid-handlebars/tests/messages/primary",
            secondary: "%fluid-handlebars/tests/messages/secondary"
        },
        "en_us");

    jqUnit.assertEquals("Locale content should have been loaded as expected (from a map).", "Things are fine.", fluid.get(messageBundle, "en_us.how-are-things"));

    jqUnit.assertEquals("Content with no language/locale should be stored in the default locale.", "Yes, this works.", fluid.get(messageBundle, "en_us.files-without-suffixes-stored-in-default-locale"));

    jqUnit.assertEquals("Locale content from the primary directory should have been added to the language data.", "Things are fine.", fluid.get(messageBundle, "en.how-are-things"));

    jqUnit.assertEquals("Content should have been added from a secondary directory.", "Works just fine.", fluid.get(messageBundle, "en_us.unique-to-secondary-dir"));
    jqUnit.assertEquals("Content should have been merged from a secondary directory.", "Young.  I feel young.", fluid.get(messageBundle, "en_us.merged-key"));
    jqUnit.assertEquals("Unique locale content from a secondary directory should have been added to the language data.", "Works just fine.", fluid.get(messageBundle, "en.unique-to-secondary-dir"));

    var messageBundleFromArray = fluid.handlebars.i18n.loadMessageBundles(["%fluid-handlebars/tests/messages/primary","%fluid-handlebars/tests/messages/secondary"],"en_us");
    jqUnit.assertEquals("Locale content should have been loaded as expected (from an array).", "Things are fine.", fluid.get(messageBundleFromArray, "en_us.how-are-things"));

});

jqUnit.test("Testing message loading error handling.", function () {
    var messageBundle = fluid.handlebars.i18n.loadMessageBundles(["%non-existing-package/messages", "/bad/path/messages"]);
    jqUnit.assertDeepEq("An empty message bundle should be returned if no valid message directories are provided.", {}, messageBundle);
});

/*
{
  "en_gb": {
    "four-oh-four": "Oh dear.  Nothing here.",
    "how-are-things": "Things are tolerable.",
    "noQuotes": "Quote 'works' unquote.",
    "hasComment": "No comment at this time.",
    "message-key-from-uppercase": "IT WORKS!"
  },
  "en": {
    "four-oh-four": "Page not found.",
    "message-key-language-only": "Works.",
    "unique-to-secondary-dir": "Works just fine.",
    "merged-key": "Young.  I feel young.",
    "files-without-suffixes-stored-in-default-locale": "Yes, this works.",
    "how-are-things": "This is fine.",
    "shallow-variable": "This is %condition.",
    "deep-variable": "This is even %deep.value.",
    "noQuotes": "Quote 'works' unquote.",
    "hasComment": "No comment at this time.",
    "message-key-from-uppercase": "IT WORKS!"
  },
  "nl_be": {
    "keyboard": "klavier",
    "four-oh-four": "Hier is er geen kat."
  },
  "nl": {
    "how-are-things": "Het gaat goed.",
    "wave": "golf",
    "four-oh-four": "Hier is er geen hond.",
    "keyboard": "toetesenbord",
    "microwave": "magnetron"
  },
  "nl_nl": {
    "four-oh-four": "Hier is er geen hond.",
    "keyboard": "toetesenbord",
    "microwave": "magnetron"
  },
  "en_us": {
    "unique-to-secondary-dir": "Works just fine.",
    "merged-key": "Young.  I feel young.",
    "files-without-suffixes-stored-in-default-locale": "Yes, this works.",
    "four-oh-four": "Nothing to see here.",
    "how-are-things": "This is fine.",
    "shallow-variable": "This is %condition.",
    "deep-variable": "This is even %deep.value."
  }
}
*/

jqUnit.test("Testing deriving messages from message bundle by language/locale.", function () {
    var messageBundles = fluid.handlebars.i18n.loadMessageBundles(["%fluid-handlebars/tests/messages/primary", "%fluid-handlebars/tests/messages/secondary"], "en_us");

    var nlNlMessages =  fluid.handlebars.i18n.deriveMessageBundleFromHeader("nl_nl", messageBundles);
    jqUnit.assertEquals("Locale specific data should be included in a bundle derived from a locale.", "Hier is er geen hond.", fluid.get(nlNlMessages, "four-oh-four"));
    jqUnit.assertEquals("Language data should be included in a bundle derived from a locale.", "Het gaat goed.", fluid.get(nlNlMessages, "how-are-things"));
    jqUnit.assertEquals("Unique data from the default locale should be included in a bundle derived from a locale.", "This is %condition.", fluid.get(nlNlMessages, "shallow-variable"));

    var nlBeMessages =  fluid.handlebars.i18n.deriveMessageBundleFromHeader("nl_be", messageBundles);
    jqUnit.assertEquals("Locale specific data should be included in a bundle derived from a locale.", "Hier is er geen kat.", fluid.get(nlBeMessages, "four-oh-four"));
    jqUnit.assertEquals("Language data should be included in a bundle derived from a locale.", "Het gaat goed.", fluid.get(nlBeMessages, "how-are-things"));
    jqUnit.assertEquals("Unique from a locale with the same language should be included in a bundle derived from a locale.", "golf", fluid.get(nlBeMessages, "wave"));

    var enInMessages = fluid.handlebars.i18n.deriveMessageBundleFromHeader("en_in", messageBundles);
    jqUnit.assertEquals("A locale for which we have no messages should fail over to the language.", "Things are fine.", fluid.get(enInMessages, "how-are-things"));

    var zhTwMessages = fluid.handlebars.i18n.deriveMessageBundleFromHeader("zh_tw", messageBundles);
    jqUnit.assertEquals("A language for which we have no messages should fail over to the default.", "Things are fine.", fluid.get(zhTwMessages, "how-are-things"));

    jqUnit.assertDeepEq("Missing headers should be handled correctly in deriveMessageBundleFromHeader.", { "this": "works"}, fluid.handlebars.i18n.deriveMessageBundleFromHeader(undefined, { "my-default": { "this": "works"} }, "my-default"));

    jqUnit.assertDeepEq("Missing headers should be handled correctly in getAllLocalesFromHeader.", ["*"],  fluid.handlebars.i18n.getAllLocalesFromHeader());

    jqUnit.assertDeepEq("Garbled headers should be handled correctly in getAllLocalesFromHeader.", ["*"],  fluid.handlebars.i18n.getAllLocalesFromHeader(Math.PI));
});

jqUnit.test("Testing language detection from locale.", function () {
    jqUnit.assertEquals("A valid locale should return a language.", "en", fluid.handlebars.i18n.languageFromLocale("en_us"));
    jqUnit.assertEquals("Upper-case locale data should result in a lower case language.", "en", fluid.handlebars.i18n.languageFromLocale("EN_US"));
    jqUnit.assertEquals("A nonsensical locale should by handled correctly.", undefined, fluid.handlebars.i18n.languageFromLocale("Narnia"));
    jqUnit.assertEquals("An undefined locale should by handled correctly.", undefined, fluid.handlebars.i18n.languageFromLocale(undefined));
    jqUnit.assertEquals("A null locale should by handled correctly.", undefined, fluid.handlebars.i18n.languageFromLocale(null));
});
