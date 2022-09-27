export const messagesFrCA = {

    "http-301": {
        msg: "Redirection permanente. Vous devez mettre à jour ce lien, sauf s'il s'agit d'un permalien."
    },

    "http-30x-https-upgrade": {
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
        msg: "Redirige vers une version sécurisée (<code>https</code>) du site. L'URL a aussi possiblement changé. Vérifiez ce lien."
    },

    "http-30x-permanent-redirect-failure": {
        msg: "Redirection permanente vers un lien brisé. Vous devez mettre à jour ce lien."
    },

    "http-30x-permanent-redirect-successfull": {
        msg: "Redirection permanente. Vous devez mettre à jour ce lien, sauf s'il s'agit d'un permalien."
    },

    "http-30x-recursive-redirection": {
        msg: "Redirections circulaires rencontrées. Vérifiez le lien."
    },

    "http-400": {
        msg: "Veuillez vérifier ce lien."
    },

    "http-401": {
        msg: "Une authentification est nécessaire pour accéder à la ressource."
    },

    "http-403": {
        msg: "L'accès à cette page a été refusé. Vérifiez le lien."
    },

    "http-404": {
        msg: "Lien brisé. Vérifiez le lien."
    },

    "http-404-by-url": {
        msg: "Lien brisé. Vérifiez le lien."
    },

    "http-408": {
        msg: "Le délai de réponse a expiré."
    },

    "http-410": {
        msg: "Cette page a été retirée."
    },

    "http-412": {
        msg: "Accès refusé. Certaines conditions n'ont pas été remplies."
    },

    "http-429": {
        msg: "Trop de requêtes ont été émises."
    },

    "http-500": {
        msg: "Erreur interne du serveur. Vérifiez le lien."
    },

    "http-501": {
        msg: "Le serveur ne comprend pas la requête."
    },

    "http-502": {
        msg: "Un serveur Proxy a refusé l'accès. Vérifiez le lien."
    },

    "http-503": {
        msg: "Impossible de vérifier le lien. Service temporairement indisponible ou en maintenance. Vérifiez le lien."
    },

    "http-504": {
        msg: "Impossible de vérifier le lien. Délai d'attente expiré lors du traitement de la requête. Vérifiez le lien."
    },

    "http-512-599": {
        msg: "Le fichier n'a pas été trouvé. Une erreur serveur est survenue."
    },

    "http-6xx": {
        msg: "Le fichier n'a pas été trouvé. Une erreur inconnue est survenue."
    },

    "mail-invalid-syntax": {
        msg: "L'adresse de courriel n'a pas une syntaxe valide.",
        pattern: "(.+)",
        substitution: "L'adresse de courriel n'a pas une syntaxe valide: $1"
    },

    "net-certificate": {
        msg: "La connexion avec le site Web n'est pas privée puisque le certificat de sécurité du site est invalide"
    },

    "net-connection": {
        msg: "Ce site est inaccessible"
    },

    "net-http": {
        msg: "Cette page ne fonctionne pas"
    },

    "net-system": {
        msg: "Une errer est survenue lors du moisonnage de ce lien. Veuillez le vérifier"
    },

    "url-invalid-url": {
        msg: "L'URL n'a pas une syntaxe valide.",
        pattern: "(.+)",
        substitution: "L'URL n'a pas une syntaxe valide: $1"
    },


    "test-debug": {
        pattern: "test\\-(.+)",
        substitution: "Test de débug: $1",
        msg: "Test debug"
    }
}