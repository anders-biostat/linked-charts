To generate the documentation you should:
  - install 'jsdoc' and 'docstrap' packages;
  		npm install -g jsdoc
  		npm install -g ink-docstrap
  - make sure that in 'jsdoc_conf.json' file opts.template variable contains path
  	to docstrap templates. (If you are installing npm modules in a default folder,
  	it should).
  - run jsdocs
			jsdoc -c jsdoc_conf.json -R additionalFiles/readme.md;