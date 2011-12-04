#
#  Build Script for comopressing Expanz JavaScript SDK libraries
#     By: Adam Tait
#
#        to run, install ruby and "gem install yui-compressor" (https://github.com/sstephenson/ruby-yui-compressor)
#

require "rubygems"
require "yui/compressor"

class ExpanzFiles

   @@root = "./js/"

   @@common = [   "jquery-1.7.1.js",
                  "modernizr-2.0.6.js",
                  "jquery.cookies.2.2.0.js",
                  "json2.js",
                  "underscore.js",
                  "backbone.js",
                  "expanz.factory.js",
                  "expanz.model.js", 
                  "expanz.net.js", 
                  "expanz.storage.js" ]

   @@login = [ "expanz.view.login.js",
               "expanz.model.login.js",
               "expanz.login.js" ]

   @@main =  [ "expanz.model.data.js",
               "expanz.view.js",
               "expanz.js" ]

   def addRoot (filenames)
      filenames.map {|name| @@root.dup << name}
   end

   def login
      addRoot( @@common.dup.concat(@@login) )
   end

   def main
      addRoot( @@common.dup.concat(@@main) )
   end

end


def compressFile(filename)
   file = File.open( filename, "rb")
   compressor = YUI::JavaScriptCompressor.new
   compressor.compress( file.read )
end

def compose(title, contents)
      output = "// -- #{title} --\n"
      output << contents << "\n\n"
      output
end



filenames = ExpanzFiles.new

[["js/expanz-login-min.js", filenames.login],
   ["js/expanz-min.js", filenames.main]].each do |filename, toCompress, precompressed|
   output = File.open( filename, "w" )
   output.puts("///\n///  Expanz JavaScript SDK\n///   #{filename}\n///  usage: please refer to http://docs.expanz.com\n///\n\n")
   toCompress.each do |filename|
      output.puts( compose(filename, compressFile(filename)) )
   end
   output.close
end

