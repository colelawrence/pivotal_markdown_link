// @ts-check
/// <reference types="jquery"/>
globalThis.PMDL = (() => {
  var mdTemplate = '[PT{{ID}}: "{{NAME}}"]({{URL}})';
  var gitTemplate = "{{TYPE}}-{{NAME}}-{{ID}}";

  const mutationIsMatch = (mutation) =>
    mutation.target.className == "tn-panel__loom" &&
    mutation.addedNodes.length == 1;

  const checkMutation = (mutation) => {
    if (!mutationIsMatch(mutation)) return;

    const clipButton = findCopyButton(mutation);
    if (clipButton) {
      $(clipButton).before(createMDButton(clipButton));
      $(clipButton).before(createGitButton(clipButton));
    }

    const added = $(mutation.addedNodes);
    $(added).find("div.story").css("width", "310px");
    $(added).find("div.actions").css("width", "310px");
  };

  const checkMutations = (mutations) => mutations.forEach(checkMutation);

  const findCopyButton = (mutation) => {
    var added = $(mutation.addedNodes);
    return added.find(".clipboard_button:first")[0];
  };

  const storyId = (story) => story.find("input.id.text_value").val();

  const bareId = (story) => storyId(story).replace(/^#/, "");

  const storyUrl = (story) => story.find("button.link").data("clipboard-text");

  const storyName = (story) =>
    story.find("fieldset.name [name='story[name]']").val();

  const storyType = (story) => {
    const type = story.find("[name='story[story_type]']").val();

    switch (type) {
      case "chore":
        return "feature-chore";
      case "bug":
        return "feature-fix";
      case "feature":
        return "feature";
      default:
        return "feature";
    }
  };

  const gitName = (story) => {
    const name = story.find("fieldset.name [name='story[name]']").val();

    const lowercase = name.toLowerCase();

    const tokens = stopWords(lowercase.split(" "));

    const stripped = tokens.map((token) => {
      return token.replace(/([^a-z-])+/g, "");
    });

    return stripped.slice(0, 5).join("-");
  };

  const getStory = (baseButton) => $(baseButton).parents(".story.item");

  const storyMDText = (story) =>
    mdTemplate
      .replace(/{{ID}}/, bareId(story))
      .replace(/{{URL}}/, storyUrl(story))
      .replace(/{{NAME}}/, storyName(story));

  const storyGitText = (story) =>
    gitTemplate
      .replace(/{{TYPE}}/, storyType(story))
      .replace(/{{NAME}}/, gitName(story))
      .replace(/{{ID}}/, bareId(story));

  const createMDButton = (baseButton) => {
    var story = getStory(baseButton);
    var cloned = $(baseButton).clone();

    cloned.addClass("markdown-link");
    cloned.attr("data-clipboard-text", storyMDText(story));
    cloned.attr(
      "title",
      "Copy this story's link to your clipboard as markdown"
    );
    return cloned;
  };

  const createGitButton = (baseButton) => {
    var story = getStory(baseButton);
    var cloned = $(baseButton).clone();

    cloned.addClass("git-branch-link");
    cloned.attr("data-clipboard-text", storyGitText(story));
    cloned.attr("title", "Copy a Git-friendly branch name to your clipboard!");
    return cloned;
  };

  const cleanFullscreenStyle = () => {
    $($.find("div.info_box_wrapper")).width("310px");
    $($.find("div.story")).width("310px");
    $($.find("div.story")).css("margin-right", "0");
    $($.find("div.actions")).width("310px");
    $("aside").css("right", "15px");
  };

  const words = [
    "&",
    "+",
    "about",
    "after",
    "all",
    "also",
    "am",
    "an",
    "and",
    "another",
    "any",
    "are",
    "as",
    "at",
    "be",
    "because",
    "been",
    "before",
    "being",
    "between",
    "both",
    "but",
    "by",
    "came",
    "can",
    "come",
    "could",
    "did",
    "do",
    "each",
    "for",
    "from",
    "get",
    "got",
    "has",
    "had",
    "he",
    "have",
    "her",
    "here",
    "him",
    "himself",
    "his",
    "how",
    "if",
    "in",
    "into",
    "is",
    "it",
    "like",
    "make",
    "many",
    "me",
    "might",
    "more",
    "most",
    "much",
    "must",
    "my",
    "never",
    "now",
    "of",
    "on",
    "only",
    "or",
    "other",
    "our",
    "out",
    "over",
    "said",
    "same",
    "see",
    "should",
    "since",
    "some",
    "still",
    "such",
    "take",
    "than",
    "that",
    "the",
    "their",
    "them",
    "then",
    "there",
    "these",
    "they",
    "this",
    "those",
    "through",
    "to",
    "too",
    "under",
    "up",
    "very",
    "was",
    "way",
    "we",
    "well",
    "were",
    "what",
    "where",
    "which",
    "while",
    "who",
    "with",
    "would",
    "you",
    "your",
    "a",
    "i",
  ];

  const stopWords = (tokens) => {
    if (typeof tokens !== "object") {
      throw new Error("expected Arrays try: removeStopwords(Array[, Array])");
    }
    return tokens.filter((value) => words.indexOf(value.toLowerCase()) === -1);
  };

  const init = () => {
    const reg = /\/stories\//g;

    // if in a full-screen story
    if (reg.test(window.location.href)) {
      $(".clipboard_button:first").waitUntilExists(() => {
        const clipButton = $(".clipboard_button:first")[0];
        $(clipButton).before(createMDButton(clipButton));
        $(clipButton).before(createGitButton(clipButton));

        cleanFullscreenStyle();
      }, true);
    } else {
      var observer = new MutationObserver(checkMutations);

      observer.observe(document, {
        subtree: true,
        childList: true,
      });
    }
  };

  return {
    init: init,
  };
})();

$(function () {
  PMDL.init();
});
