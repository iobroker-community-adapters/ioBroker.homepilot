# ioBroker Adapter Development with GitHub Copilot

**Version:** 0.4.0
**Template Source:** https://github.com/DrozmotiX/ioBroker-Copilot-Instructions

This file contains instructions and best practices for GitHub Copilot when working on ioBroker adapter development.

## Project Context

You are working on an ioBroker adapter. ioBroker is an integration platform for the Internet of Things, focused on building smart home and industrial IoT solutions. Adapters are plugins that connect ioBroker to external systems, devices, or services.

### Adapter-Specific Context: Rademacher Homepilot

This adapter connects to Rademacher Homepilot stations to control Duofern devices in smart home environments. The Homepilot system is primarily used for controlling blinds, shutters, awnings, and other motorized window coverings.

**Key Details:**
- **Adapter Name**: homepilot
- **Primary Function**: Controls Rademacher Homepilot station to manage Duofern wireless devices (blinds, shutters, awnings, door/window sensors)
- **Target Hardware**: Rademacher Homepilot Base Station (firmware < v5.0, pre-September 2019)
- **Communication Protocol**: HTTP REST API over local network
- **Key Dependencies**: 
  - `request` library for HTTP communication with the station
  - `xml2js` for parsing XML responses from the Homepilot API
  - `@iobroker/adapter-core` for ioBroker adapter framework
- **Configuration Requirements**: 
  - Homepilot station IP address
  - Username and password for station access
  - Polling interval for device state updates
  - Device discovery and management via station's web API

**Important Constraints:**
- Only compatible with older Homepilot firmware versions (< v5.0)
- Newer stations should use the separate `homepilot20` adapter
- Local network communication only (no cloud connectivity)
- Requires station to be in local network and accessible via HTTP

## Testing

### Unit Testing
- Use Jest as the primary testing framework for ioBroker adapters
- Create tests for all adapter main functions and helper methods
- Test error handling scenarios and edge cases
- Mock external API calls and hardware dependencies
- For adapters connecting to APIs/devices not reachable by internet, provide example data files to allow testing of functionality without live connections
- Example test structure:
  ```javascript
  describe('AdapterName', () => {
    let adapter;
    
    beforeEach(() => {
      // Setup test adapter instance
    });
    
    test('should initialize correctly', () => {
      // Test adapter initialization
    });
  });
  ```

### Integration Testing

**IMPORTANT**: Use the official `@iobroker/testing` framework for all integration tests. This is the ONLY correct way to test ioBroker adapters.

**Official Documentation**: https://github.com/ioBroker/testing

#### Framework Structure
Integration tests MUST follow this exact pattern:

```javascript
const path = require('path');
const { tests } = require('@iobroker/testing');

// Define test coordinates or configuration
const TEST_COORDINATES = '52.520008,13.404954'; // Berlin
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// Use tests.integration() with defineAdditionalTests
tests.integration(path.join(__dirname, '..'), {
    defineAdditionalTests({ suite }) {
        suite('Test adapter with specific configuration', (getHarness) => {
            let harness;

            before(() => {
                harness = getHarness();
            });

            it('should configure and start adapter', function () {
                return new Promise(async (resolve, reject) => {
                    try {
                        harness = getHarness();
                        
                        // Get adapter object using promisified pattern
                        const obj = await new Promise((res, rej) => {
                            harness.objects.getObject('system.adapter.your-adapter.0', (err, o) => {
                                if (err) return rej(err);
                                res(o);
                            });
                        });
                        
                        if (!obj) {
                            return reject(new Error('Adapter object not found'));
                        }

                        // Configure adapter properties
                        Object.assign(obj.native, {
                            position: TEST_COORDINATES,
                            createCurrently: true,
                            createHourly: true,
                            createDaily: true,
                            // Add other configuration as needed
                        });

                        // Set the updated configuration
                        harness.objects.setObject(obj._id, obj);

                        console.log('✅ Step 1: Configuration written, starting adapter...');
                        
                        // Start adapter and wait
                        await harness.startAdapterAndWait();
                        
                        console.log('✅ Step 2: Adapter started');

                        // Wait for adapter to process data
                        const waitMs = 15000;
                        await wait(waitMs);

                        console.log('🔍 Step 3: Checking states after adapter run...');
                        
                        // Get all states created by adapter
                        const stateIds = await harness.dbConnection.getStateIDs('your-adapter.0.*');
                        
                        console.log(`📊 Found ${stateIds.length} states`);

                        if (stateIds.length > 0) {
                            console.log('✅ Adapter successfully created states');
                            
                            // Show sample of created states
                            const allStates = await new Promise((res, rej) => {
                                harness.states.getStates(stateIds, (err, states) => {
                                    if (err) return rej(err);
                                    res(states || []);
                                });
                            });
                            
                            console.log('📋 Sample states created:');
                            stateIds.slice(0, 5).forEach((stateId, index) => {
                                const state = allStates[index];
                                console.log(`   ${stateId}: ${state && state.val !== undefined ? state.val : 'undefined'}`);
                            });
                            
                            await harness.stopAdapter();
                            resolve(true);
                        } else {
                            console.log('❌ No states were created by the adapter');
                            reject(new Error('Adapter did not create any states'));
                        }
                    } catch (error) {
                        reject(error);
                    }
                });
            }).timeout(40000);
        });
    }
});
```

#### Testing Both Success AND Failure Scenarios

**IMPORTANT**: For every "it works" test, implement corresponding "it doesn't work and fails" tests. This ensures proper error handling and validates that your adapter fails gracefully when expected.

```javascript
// Example: Testing successful configuration
it('should configure and start adapter with valid configuration', function () {
    return new Promise(async (resolve, reject) => {
        // ... successful configuration test as shown above
    });
}).timeout(40000);

// Example: Testing failure scenarios
it('should NOT create daily states when daily is disabled', function () {
    return new Promise(async (resolve, reject) => {
        try {
            harness = getHarness();
            
            console.log('🔍 Step 1: Fetching adapter object...');
            const obj = await new Promise((res, rej) => {
                harness.objects.getObject('system.adapter.your-adapter.0', (err, o) => {
                    if (err) return rej(err);
                    res(o);
                });
            });
            
            if (!obj) return reject(new Error('Adapter object not found'));
            console.log('✅ Step 1.5: Adapter object loaded');

            console.log('🔍 Step 2: Updating adapter config...');
            Object.assign(obj.native, {
                position: TEST_COORDINATES,
                createCurrently: false,
                createHourly: true,
                createDaily: false, // Daily disabled for this test
            });

            await new Promise((res, rej) => {
                harness.objects.setObject(obj._id, obj, (err) => {
                    if (err) return rej(err);
                    console.log('✅ Step 2.5: Adapter object updated');
                    res(undefined);
                });
            });

            console.log('🔍 Step 3: Starting adapter...');
            await harness.startAdapterAndWait();
            console.log('✅ Step 4: Adapter started');

            console.log('⏳ Step 5: Waiting 20 seconds for states...');
            await new Promise((res) => setTimeout(res, 20000));

            console.log('🔍 Step 6: Fetching state IDs...');
            const stateIds = await harness.dbConnection.getStateIDs('your-adapter.0.*');

            console.log(`📊 Step 7: Found ${stateIds.length} total states`);

            const hourlyStates = stateIds.filter((key) => key.includes('hourly'));
            if (hourlyStates.length > 0) {
                console.log(`✅ Step 8: Correctly ${hourlyStates.length} hourly weather states created`);
            } else {
                console.log('❌ Step 8: No hourly states created (test failed)');
                return reject(new Error('Expected hourly states but found none'));
            }

            // Check daily states should NOT be present
            const dailyStates = stateIds.filter((key) => key.includes('daily'));
            if (dailyStates.length === 0) {
                console.log(`✅ Step 9: No daily states found as expected`);
            } else {
                console.log(`❌ Step 9: Daily states present (${dailyStates.length}) (test failed)`);
                return reject(new Error('Expected no daily states but found some'));
            }

            await harness.stopAdapter();
            console.log('🛑 Step 10: Adapter stopped');

            resolve(true);
        } catch (error) {
            reject(error);
        }
    });
}).timeout(40000);

// Example: Testing missing required configuration  
it('should handle missing required configuration properly', function () {
    return new Promise(async (resolve, reject) => {
        try {
            harness = getHarness();
            
            console.log('🔍 Step 1: Fetching adapter object...');
            const obj = await new Promise((res, rej) => {
                harness.objects.getObject('system.adapter.your-adapter.0', (err, o) => {
                    if (err) return rej(err);
                    res(o);
                });
            });
            
            if (!obj) return reject(new Error('Adapter object not found'));

            console.log('🔍 Step 2: Removing required configuration...');
            // Remove required configuration to test failure handling
            delete obj.native.position; // This should cause failure or graceful handling

            await new Promise((res, rej) => {
                harness.objects.setObject(obj._id, obj, (err) => {
                    if (err) return rej(err);
                    res(undefined);
                });
            });

            console.log('🔍 Step 3: Starting adapter...');
            await harness.startAdapterAndWait();

            console.log('⏳ Step 4: Waiting for adapter to process...');
            await new Promise((res) => setTimeout(res, 10000));

            console.log('🔍 Step 5: Checking adapter behavior...');
            const stateIds = await harness.dbConnection.getStateIDs('your-adapter.0.*');

            // Check if adapter handled missing configuration gracefully
            if (stateIds.length === 0) {
                console.log('✅ Adapter properly handled missing configuration - no invalid states created');
                resolve(true);
            } else {
                console.log('⚠️  Adapter created states despite missing configuration - check if this is intended behavior');
                resolve(true); // May still pass if this is expected behavior
            }

            await harness.stopAdapter();
        } catch (error) {
            reject(error);
        }
    });
}).timeout(40000);
```

#### API Authentication Testing

When testing adapters that use external APIs with authentication:

```javascript
// Helper function to encrypt password for testing
async function encryptPassword(harness, cleartext) {
    return new Promise((resolve, reject) => {
        if (!cleartext) return resolve(cleartext);
        
        harness.adapter.encrypt(cleartext, (encryptedValue) => {
            if (encryptedValue) {
                resolve(encryptedValue);
            } else {
                reject(new Error('Failed to encrypt password'));
            }
        });
    });
}

// When directly accessing protected states
async function accessState(harness, stateId) {
    return new Promise((resolve) => {
        harness.states.getState(stateId, (err, state) => {
            if (err || !state) {
                return resolve(null);
            }
            
            resolve(state);
        });
    });
}

// Alternative: Use adapter's built-in state access methods
function getStateValue(harness, stateId) {
    const state = harness._states[stateId];
    
    return state ? state.val : undefined;
}

// Run actual API integration test with authentication
function createAdapterWithDemoCredentials(harness, logger) {
    logger.info(`Setting adapter configuration...`);
    
    const testConfig = {
        username: 'demo@weatherprovider.com',
        password: 'demo_credentials', 
        location: {
            longitude: 13.404954,
            latitude: 52.520008
        },
        pollInterval: 30000,
        enableCurrently: true,
        enableHourly: true,
        enableDaily: true,
    };

    logger.info(`Setting adapter configuration... Done`);
    
    return testConfig;
}

// Check results based on adapter type
function validateAdapterResults(logger, stateIds, adapterSpecific = {}) {
    if (stateIds.length === 0) {
        logger.error(`No states found - adapter likely failed to start properly`);
        return false;
    }

    logger.info(`Found ${stateIds.length} total states created by adapter`);
    
    // Ensure connection state exists
    const connectionState = stateIds.find(id => id.includes('info.connection'));
    if (connectionState) {
        logger.info(`✅ Connection state found: ${connectionState}`);
    } else {
        logger.warn(`❌ Missing info.connection state`);
        return false;
    }
    
    return true;
}

// Run integration tests with demo credentials
tests.integration(path.join(__dirname, ".."), {
    defineAdditionalTests({ suite }) {
        suite("API Testing with Demo Credentials", (getHarness) => {
            let harness;
            
            before(() => {
                harness = getHarness();
            });

            it("Should connect to API and initialize with demo credentials", async () => {
                console.log("Setting up demo credentials...");
                
                if (harness.isAdapterRunning()) {
                    await harness.stopAdapter();
                }
                
                const encryptedPassword = await encryptPassword(harness, "demo_password");
                
                await harness.changeAdapterConfig("your-adapter", {
                    native: {
                        username: "demo@provider.com",
                        password: encryptedPassword,
                        // other config options
                    }
                });

                console.log("Starting adapter with demo credentials...");
                await harness.startAdapter();
                
                // Wait for API calls and initialization
                await new Promise(resolve => setTimeout(resolve, 60000));
                
                const connectionState = await harness.states.getStateAsync("your-adapter.0.info.connection");
                
                if (connectionState && connectionState.val === true) {
                    console.log("✅ SUCCESS: API connection established");
                    return true;
                } else {
                    throw new Error("API Test Failed: Expected API connection to be established with demo credentials. " +
                        "Check logs above for specific API errors (DNS resolution, 401 Unauthorized, network issues, etc.)");
                }
            }).timeout(120000);
        });
    }
});
```

## Development Best Practices

### Error Handling
- Always wrap external API calls in try-catch blocks
- Use proper logging levels (error, warn, info, debug)
- Implement timeout handling for network requests
- Handle network failures gracefully with appropriate error messages
- For the Homepilot adapter specifically:
  - Handle HTTP connection errors to the station
  - Validate XML response format before parsing
  - Implement proper retry logic for failed requests
  - Handle authentication failures gracefully

### State Management
- Use appropriate data types for state values
- Include proper state descriptions and units
- Implement state change callbacks where needed
- Clean up states appropriately in unload() method
- For Homepilot devices:
  - Map device states to appropriate ioBroker types (numbers for positions, booleans for switches)
  - Use consistent naming conventions for device channels
  - Handle device-specific capabilities (e.g., tilt vs. position for blinds)

### Configuration
- Validate configuration parameters on startup
- Use encrypted storage for sensitive data (passwords, API keys)
- Provide meaningful error messages for invalid configurations
- For Homepilot adapter:
  - Validate IP address format and reachability
  - Test station authentication during setup
  - Provide clear guidance for supported firmware versions

### Performance
- Implement appropriate polling intervals to avoid overwhelming external services
- Use efficient data structures for caching
- Minimize memory usage, especially for long-running adapters
- For Homepilot integration:
  - Batch device status requests where possible
  - Cache device information to reduce API calls
  - Implement intelligent polling (only when changes detected)

### Code Structure
- Follow ioBroker adapter conventions
- Use ES6+ features appropriately
- Implement proper module exports
- Follow the established ioBroker adapter file structure:
  ```
  adapter-name/
  ├── main.js              // Main adapter file
  ├── io-package.json      // Adapter configuration
  ├── package.json         // Node.js package info
  ├── admin/              // Admin interface files
  ├── lib/                // Helper libraries (if needed)
  └── test/               // Test files
  ```

### Homepilot-Specific Development Guidelines

#### Device Communication
- Use XML parsing for Homepilot API responses
- Implement proper device discovery and enumeration
- Handle different device types (blinds, shutters, sensors) appropriately
- Respect device capabilities and limitations

#### State Mapping
- Map Homepilot device positions (0-100%) to ioBroker states
- Handle different position modes (absolute vs. relative)
- Implement proper state acknowledgment for control commands
- Support device-specific features (tilt, intermediate positions)

#### API Integration
- Use HTTP GET/POST requests for device control
- Parse XML responses using xml2js library
- Implement proper session management if required
- Handle station firmware differences gracefully

## Debugging and Troubleshooting

### Common Issues
1. **Connection Problems**: Check network connectivity and station accessibility
2. **Authentication Failures**: Verify username/password and station settings
3. **Device Not Responding**: Check device battery, radio connection, and device pairing
4. **State Update Issues**: Verify polling intervals and API response handling

### Logging Best Practices
- Use appropriate log levels for different types of information
- Include context information in log messages
- Log API requests and responses (excluding sensitive data)
- Provide actionable error messages for users

### For Homepilot Adapter
```javascript
// Good logging examples
this.log.info(`Connecting to Homepilot station at ${this.config.stationIP}`);
this.log.debug(`Device ${deviceId} position changed from ${oldPos} to ${newPos}`);
this.log.warn(`Device ${deviceId} not responding, will retry in ${retryDelay}ms`);
this.log.error(`Failed to authenticate with station: ${error.message}`);
```

## Compliance and Standards

### ioBroker Standards
- Follow ioBroker adapter development guidelines
- Use the official adapter template as a starting point
- Implement proper lifecycle methods (ready, unload, etc.)
- Follow ioBroker state naming conventions

### Code Quality
- Use ESLint for code quality
- Implement proper error handling
- Write meaningful comments for complex logic
- Follow consistent coding style

### Documentation
- Update README.md with configuration instructions
- Document any special requirements or limitations
- Provide examples of typical usage scenarios
- For Homepilot adapter: Include firmware version compatibility information