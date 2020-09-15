module.exports = {
    aclRules: [
        //administrator
        {
            roles: 'administrator',
            allows: [{
                resources: [
                    'role',
                    'user',
                    'role_to_user',
                ],
                permissions: '*'
            }]
        },

        //models
        /**
         * Model: Accession
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'Accession',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'Accession',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'Accession',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'Accession',
                permissions: 'delete'
            }]
        },
        /**
         * Model: dog
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'dog',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'dog',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'dog',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'dog',
                permissions: 'delete'
            }]
        },
        /**
         * Model: dog
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'dog',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'dog',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'dog',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'dog',
                permissions: 'delete'
            }]
        },
        /**
         * Model: dog
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'dog',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'dog',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'dog',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'dog',
                permissions: 'delete'
            }]
        },
        /**
         * Model: Location
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'Location',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'Location',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'Location',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'Location',
                permissions: 'delete'
            }]
        },
        /**
         * Model: Measurement
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'Measurement',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'Measurement',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'Measurement',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'Measurement',
                permissions: 'delete'
            }]
        },
        /**
         * Model: parrot
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'parrot',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot',
                permissions: 'delete'
            }]
        },
        /**
         * Model: parrot
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'parrot',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot',
                permissions: 'delete'
            }]
        },
        /**
         * Model: parrot
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'parrot',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot',
                permissions: 'delete'
            }]
        },
        /**
         * Model: person
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'person',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'person',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'person',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'person',
                permissions: 'delete'
            }]
        },
        /**
         * Model: person
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'person',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'person',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'person',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'person',
                permissions: 'delete'
            }]
        },
        /**
         * Model: person
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'person',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'person',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'person',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'person',
                permissions: 'delete'
            }]
        },

        //adapters
        /**
         * Adapter: dog_instance1
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'dog_instance1',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'dog_instance1',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'dog_instance1',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'dog_instance1',
                permissions: 'delete'
            }]
        },
        /**
         * Adapter: dog_instance2
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'dog_instance2',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'dog_instance2',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'dog_instance2',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'dog_instance2',
                permissions: 'delete'
            }]
        },
        /**
         * Adapter: parrot_instance1
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot_instance1',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'parrot_instance1',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot_instance1',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot_instance1',
                permissions: 'delete'
            }]
        },
        /**
         * Adapter: parrot_instance2
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot_instance2',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'parrot_instance2',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot_instance2',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot_instance2',
                permissions: 'delete'
            }]
        },
        /**
         * Adapter: person_instance1
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'person_instance1',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'person_instance1',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'person_instance1',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'person_instance1',
                permissions: 'delete'
            }]
        },
        /**
         * Adapter: person_instance2
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'person_instance2',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'person_instance2',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'person_instance2',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'person_instance2',
                permissions: 'delete'
            }]
        },
    ]
}