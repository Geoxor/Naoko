{
  # Override nixpkgs to use the latest set of node packages
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/master";
  inputs.systems.url = "github:nix-systems/default";

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    systems,
  }:
    flake-utils.lib.eachSystem (import systems)
    (system: let
      pkgs = import nixpkgs {
        inherit system;
      };
    in {
      devShells.default = pkgs.mkShell {
        buildInputs = with pkgs; [
          nodejs_21
          python311
          pkg-config
          yarn-berry
          xorg.libX11
          xorg.libXext
          xorg.libXi
          libGL
          nodePackages.typescript-language-server
          nodePackages.prettier
          libuuid
        ];
        APPEND_LIBRARY_PATH = with pkgs; "${lib.makeLibraryPath [ libGL libuuid ]}";
        shellHook = ''
          export LD_LIBRARY_PATH="$APPEND_LIBRARY_PATH:$LD_LIBRARY_PATH"
        '';
      };
    });
}
