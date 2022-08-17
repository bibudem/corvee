export default {
    // "mail-no-mx-host": {
    //     code: "mail-no-mx-host",
    //     pattern: "pour (.+)\\.",
    //     substitution: "La portion 'hôte' de l'adresse de courriel ($1) n'est pas valide."
    // },

    "bot-url-outside-domain-filter": {
        code: "bot-url-outside-domain-filter",
        msg: "La cible du lien est exclue de la vérification."
    },

    "http-empty-content": {
        code: "http-empty-content",
        msg: "Le lien fonctionne mais il n'y a pas de contenu. Vérifiez ce lien."
    },

    "http-204": {
        code: "http-204",
        msg: "Veuillez vérifier ce lien."
    },

    "http-301": {
        code: "http-301",
        msg: "Redirection permanente. Vous devez mettre à jour ce lien, sauf s'il s'agit d'un permalien."
    },

    "http-30x-https-upgrade": {
        code: "http-30x-https-upgrade",
        pattern: "(.+)",
        substitution: "Redirection vers une nouvelle URL sécurisée (de <code>http</code> vers <code>https</code>): <code class=\"cvw-url\">$1</code>.  Veuillez vérifier ce lien.",
        msg: "Redirection vers une version sécurisée (<code>https</code>) du même site."
    },

    "http-30x-https-upgrade-any": {
        pattern: "(.+)",
        substitution: "Redirection vers une nouvelle URL sécurisée (de <code>http</code> vers <code>https</code>): <code class=\"cvw-url\">$1</code>.",
        msg: "Redirection vers une nouvelle URL sécurisée (de <code>http</code> vers <code>https</code>)."
    },

    "http-30x-https-upgrade-loose": {
        code: "http-30x-https-upgrade-loose",
        msg: "Redirige vers une version sécurisée (<code>https</code>) du site. L'URL a aussi possiblement changé. Vérifiez ce lien."
    },

    "http-30x-permanent-redirect": {
        code: "http-30x-permanent-redirect",
        msg: "Redirection permanente. Vous devez mettre à jour ce lien, sauf s'il s'agit d'un permalien."
    },

    // "http-302": {
    //     code: "http-302",
    //     pattern: "`([^']+)'",
    //     substitution: "Redirection temporaire vers $1.",
    //     msg: "Lien redirigé temporairement."
    // },

    // "http-303": {
    //     code: "http-303",
    //     msg: "Vous devez mettre à jour ce lien, sauf s'il s'agit d'un permalien."
    // },

    "http-30x-recursive-redirection": {
        code: "http-30x-recursive-redirection",
        msg: "Redirections circulaires rencontrées. Vérifiez le lien."
    },

    // "http-30x-redirect-with-secure-downgrade": {
    //     code: "http-30x-redirect-with-secure-downgrade",
    //     pattern: "^[^`]+`([^']+)'",
    //     substitution: "Redirection vers <code class=\"cvw-url\">$1</code>.  Veuillez vérifier ce lien.",
    //     msg: "Redirection. Veuillez vérifier ce lien."
    // },

    // "http-30x-redirect-with-secure-upgrade": {
    //     code: "http-30x-redirect-with-secure-upgrade",
    //     pattern: "^[^`]+`([^']+)'",
    //     substitution: "Redirection vers <code class=\"cvw-url\">$1</code>.  Veuillez vérifier ce lien.",
    //     msg: "Redirection. Veuillez vérifier ce lien."
    // },

    "http-400": {
        code: "http-400",
        msg: "Veuillez vérifier ce lien."
    },

    "http-401": {
        code: "http-401",
        msg: "Une authentification est nécessaire pour accéder à la ressource."
    },

    "http-403": {
        code: "http-403",
        msg: "L'accès à cette page a été refusé. Vérifiez le lien."
    },

    "http-404": {
        code: "http-404",
        msg: "Lien brisé. Vérifiez le lien."
    },

    "http-410": {
        code: "http-410",
        msg: "Cette page a été retirée."
    },

    "http-500": {
        code: "http-500",
        msg: "Erreur interne du serveur. Vérifiez le lien."
    },

    "http-501": {
        code: "http-501",
        msg: "Le serveur ne comprend pas la requête."
    },

    "http-502": {
        code: "http-502",
        msg: "Un serveur Proxy a refusé l'accès. Vérifiez le lien."
    },

    "http-503": {
        code: "http-503",
        msg: "Impossible de vérifier le lien. Service temporairement indisponible ou en maintenance. Vérifiez le lien."
    },

    "http-550": {
        code: "http-550",
        msg: "Le fichier n'a pas été trouvé."
    },

    // "https-certificate-error": {
    //     code: "https-certificate-error",
    //     pattern: "(.+)",
    //     substitution: "$1",
    //     msg: "L'hôte indiqué dans le certificat d'encryption ne correspond pas à l'hôte inscrit dans l'URL de la cible. Assurez-vous que le lien hypertexte pointe vers la bonne cible."
    // },

    // "https-certificate-verify-failed": {
    //     code: "https-certificate-verify-failed",
    //     msg: "Le robot n'a pas été en mesure de vérifier le certificat d'encryption (https) utilisé."
    // },

    // "mail-missing-at": {
    //     code: "mail-missing-at",
    //     msg: "\"@\" manquant dans l'adresse de courriel (<code>mailto:</code>)."
    // },

    // "misc-urls-parsed": {
    //     code: "misc-urls-parsed",
    //     pattern: "(\\d+) URLs parsed\\.",
    //     substitution: "$1 URLs vérifiées."
    // },

    "net-*": {
        code: "net-*",
        msg: "Une erreur réseau est survenue. Vérifiez le liens."
    },

    "net-cert-*": {
        code: "net-cert-*",
        msg: "La connection au site Web n'est pas sécurisée. Des individus malveillants tentent peut-être de subtiliser vos informations personnelles sur le site"
    },

    "net-timeout": {
        code: "net-timeout",
        msg: "Le serveur n'a pas répondu au-delà du délais fixé. Vérifiez le lien."
    },

    "url-invalid-url": {
        code: "url-invalid-url",
        msg: "L'URL n'a pas une syntaxe valide.",
        pattern: "(.+)",
        substitution: "L'URL n'a pas une syntaxe valide: $1"
    },

    // "url-content-duplicate": {
    //     code: "url-content-duplicate",
    //     pattern: "is the same as in URLs(.+)",
    //     substitution: "Cette cible a un contenu identique à $1",
    //     msg: "Contenu dupliqué"
    // },

    // "urlerror-unknown": {
    //     code: "urlerror-unknown",
    //     substitution: "Schème d'URL inconnu: “ $1 “.",
    //     pattern: "type:\\s*(.+)&",
    //     msg: "Schème d 'URL inconnu."
    // },

    "test-debug": {
        code: "test-debug",
        pattern: "test\\-(.+)",
        substitution: "Test de débug: $1",
        msg: "Test debug"
    }
}